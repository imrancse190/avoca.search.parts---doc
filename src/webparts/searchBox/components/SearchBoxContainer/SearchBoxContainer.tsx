import * as React from                               'react';
import { ISearchBoxContainerProps } from             './ISearchBoxContainerProps';
import * as strings from                             'SearchBoxWebPartStrings';
import ISearchBoxContainerState from                 './ISearchBoxContainerState';
import { PageOpenBehavior, QueryPathBehavior } from  '../../../../helpers/UrlHelper';
import { SearchBoxHelper }                     from  '../../../../helpers/SearchBoxHelper';
import { MessageBar, MessageBarType } from           'office-ui-fabric-react/lib/MessageBar';
import Downshift from                                'downshift';
import { TextField } from                            'office-ui-fabric-react/lib/TextField';
import { IconType } from                             'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from                 'office-ui-fabric-react/lib/Spinner';
import { Label } from                                'office-ui-fabric-react/lib/Label';
import * as update from                              'immutability-helper';
import styles from '../SearchBoxWebPart.module.scss';
import ISearchQuery from '../../../../models/ISearchQuery';
import NlpDebugPanel from '../NlpDebugPanel/NlpDebugPanel';
import { IconButton } from 'office-ui-fabric-react/lib/Button';


const SUGGESTION_CHAR_COUNT_TRIGGER = 3;

export default class SearchBoxContainer extends React.Component<ISearchBoxContainerProps, ISearchBoxContainerState> {

  private defaultSearchBoxId: string = "sbcId";
  private customSearchBoxId: string = "searchbox";
  
  public constructor(props: ISearchBoxContainerProps) {

    super(props);

    this.state = {
      enhancedQuery: null,
      proposedQuerySuggestions: [],
      selectedQuerySuggestions: [],
      isRetrievingSuggestions: false,
      searchInputValue: (props.inputValue) ? decodeURIComponent(props.inputValue) : '',
      termToSuggestFrom: null,
      errorMessage: null,
      showClearButton: !!props.inputValue
    };
    
    if (this.props.defaultSearchBoxIdentifier != null && this.props.defaultSearchBoxIdentifier.length != 0) {
      this.defaultSearchBoxId = this.props.defaultSearchBoxIdentifier;
    }

    this._onSearch = this._onSearch.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onQuerySuggestionSelected = this._onQuerySuggestionSelected.bind(this);
  }

  private renderSearchBoxWithAutoComplete(): JSX.Element {
    var clearButton = null;
    if (this.state.showClearButton) {
      clearButton = <IconButton iconProps={{
                        iconName: 'Clear',
                        iconType: IconType.default,
                      }} onClick= {() => { this._onSearch('', true); } } className={ styles.clearBtn }>
                    </IconButton>;
    }
    return    <div className={styles.searchFieldContainer}>
    {/* <h1 className={css(styles.searchTitle, '')}>{new UrlHelper().getParameterByName("Category") ? new UrlHelper().getParameterByName("Category") : strings.SearchInputTitle}</h1> */}
 
      <Downshift
        onSelect={ this._onQuerySuggestionSelected }
        >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          selectedItem,
          highlightedIndex,
          openMenu,
          clearItems,
        }) => (
          <div>
            <div className={ styles.searchFieldGroup }>
              <TextField {...getInputProps({
                  placeholder: this.props.placeholderText ? this.props.placeholderText : strings.SearchInputPlaceholder,
                  onKeyDown: event => {

                    if (!isOpen || (isOpen && highlightedIndex === null)) {
                      if (event.keyCode === 13) {
                        // Submit search on "Enter" 
                        this._onSearch(this.state.searchInputValue);
                      }
                      else if (event.keyCode === 27) {
                        // Clear search on "Escape" 
                        this._onSearch('', true);
                      }
                    }

                  }
              })}
              className={ styles.searchTextField }
              value={ this.state.searchInputValue }
              autoComplete= "off"
              onChanged={ (value) => {

                  this.setState({
                    searchInputValue: value,
                    showClearButton: true
                  });

                  if (this.state.selectedQuerySuggestions.length === 0) {
                    clearItems();
                    this._onChange(value);
                    openMenu();
                  } else {
                    if (!value) {

                      // Reset the selected suggestions if input is empty
                      this.setState({
                        selectedQuerySuggestions: [],
                      });
                    }
                  }
              }}/>
              {clearButton}
              <IconButton iconProps={{
                  iconName: 'Search',
                  iconType: IconType.default,
                }} onClick= {() => { this._onSearch(this.state.searchInputValue);} } className={ styles.searchBtn }>
              </IconButton>
            </div>
            {isOpen ?
              this.renderSuggestions(getItemProps, selectedItem, highlightedIndex)
            : null}
          </div>
        )}
      </Downshift>
    
      </div>;
  }

  private renderBasicSearchBox(): JSX.Element {
    var clearButton = null;
    if (this.state.showClearButton) {
      clearButton = <IconButton iconProps={{
                        iconName: 'Clear',
                        iconType: IconType.default,
                      }} onClick= {() => { this._onSearch('', true); } } className={ styles.clearBtn }>
                    </IconButton>;
    }

    return  <div className={styles.searchFieldContainer}>      
      {/* <h1 className={css(styles.searchTitle, '')}>{new UrlHelper().getParameterByName("Category") ? new UrlHelper().getParameterByName("Category") : strings.SearchInputTitle}</h1> */}
   <div className={ styles.searchFieldGroup }>
              <TextField 
                className={ styles.searchTextField }
                placeholder={ this.props.placeholderText ? this.props.placeholderText : strings.SearchInputPlaceholder }
                value={ this.state.searchInputValue }
                onChange={ (ev, value) => {
                  this.setState({
                    searchInputValue: value,
                    showClearButton: true
                  });
                }}
                onKeyDown={ (event) => {

                    if (event.keyCode === 13) {
                      // Submit search on "Enter" 
                      this._onSearch(this.state.searchInputValue);
                    }
                    else if (event.keyCode === 27) {
                      // Clear search on "Escape" 
                      this._onSearch('', true);
                    }

                }}
              />
              {clearButton}
              <IconButton iconProps={{
                  iconName: 'Search',
                  iconType: IconType.default,
                }} onClick= {() => { this._onSearch(this.state.searchInputValue);} } className={ styles.searchBtn }>
              </IconButton>
            </div>
            
            </div>;
  }

  /**
   * Renders the suggestions panel below the input control
   * @param getItemProps downshift getItemProps callback
   * @param selectedItem downshift selectedItem callback
   * @param highlightedIndex downshift highlightedIndex callback
   */
  private renderSuggestions(getItemProps, selectedItem, highlightedIndex): JSX.Element {
    
    let renderSuggestions: JSX.Element = null;
    let suggestions: JSX.Element[] = null;

    // Edge case with SPFx
    // Only in Chrome/Firefox the parent element class ".Canvas-slideUpIn" create a new stacking context due to a 'transform' operation preventing the inner content to overlap other WP
    // We need to manually set a z-index on this element to render suggestions correctly above all content.
    try {
      const parentStackingContext = this.props.domElement.closest(".Canvas-slideUpIn");
      if (parentStackingContext) {
          parentStackingContext.classList.add(styles.parentStackingCtx);
      }
    } catch (error) {}

    if (this.state.isRetrievingSuggestions && this.state.proposedQuerySuggestions.length === 0) {
      renderSuggestions = <div className={styles.suggestionPanel}>
                            <div {...getItemProps({item: null, disabled: true})}>
                              <div className={styles.suggestionItem}>
                                <Spinner size={ SpinnerSize.small }/>
                              </div>
                            </div>
                          </div>;
    }

    if (this.state.proposedQuerySuggestions.length > 0) {

      suggestions = this.state.proposedQuerySuggestions.map((suggestion, index) => {
                              return <div {...getItemProps({item: suggestion})}
                                  key={index}
                                  style={{
                                    fontWeight: selectedItem === suggestion ? 'bold' : 'normal'
                                  }}>
                                      <Label className={ highlightedIndex === index ? `${styles.suggestionItem} ${styles.selected}` : `${styles.suggestionItem}`}>
                                          <div dangerouslySetInnerHTML={{ __html: suggestion }}></div>
                                      </Label>
                                  </div>;
                                });
      
      renderSuggestions = <div className={styles.suggestionPanel}>
                            { suggestions }
                          </div>;
    }

    return renderSuggestions;
  }

  /**
   * Handler when a user enters new keywords in the search box input
   * @param inputValue 
   */
  private async _onChange(inputValue: string) {

    if (inputValue && this.props.enableQuerySuggestions) {

      if (inputValue.length >= SUGGESTION_CHAR_COUNT_TRIGGER) {

        try {

          this.setState({
            isRetrievingSuggestions: true,
            errorMessage: null
          });

          const suggestions = await this.props.searchService.suggest(inputValue);

          this.setState({
            proposedQuerySuggestions: suggestions,
            termToSuggestFrom: inputValue, // The term that was used as basis to get the suggestions from
            isRetrievingSuggestions: false
          });

        } catch(error) {
          
          this.setState({
            errorMessage: error.message,
            proposedQuerySuggestions: [],
            isRetrievingSuggestions: false
          });
        }
        
      } else {

        // Clear suggestions history
        this.setState({
          proposedQuerySuggestions: [],
        });
      }

    } else {

      if (!inputValue) {

        // Clear suggestions history
        this.setState({
          proposedQuerySuggestions: [],
        });
      }
    }
  }

  /**
   * Handler when a suggestion is selected in the dropdown
   * @param suggestion the suggestion value
   */
  private _onQuerySuggestionSelected(suggestion: string) {

    const termToSuggestFromIndex = this.state.searchInputValue.indexOf(this.state.termToSuggestFrom);
    let replacedSearchInputvalue =  this._replaceAt(this.state.searchInputValue, termToSuggestFromIndex, suggestion);

    // Remove inenr HTML markup if there is 
    replacedSearchInputvalue = replacedSearchInputvalue.replace(/(<B>|<\/B>)/g,"");

    this.setState({
      searchInputValue: replacedSearchInputvalue,
      selectedQuerySuggestions: update(this.state.selectedQuerySuggestions, { $push: [suggestion]}),
      proposedQuerySuggestions:[],
    });     
  }

  private _replaceAt(string: string, index: number, replace: string) {
    return string.substring(0, index) + replace;
  }

  /**
   * Handler when a user enters new keywords
   * @param queryText The query text entered by the user
   */
  public async _onSearch(queryText: string, isReset: boolean = false) {    

    // Don't send empty value
    if (queryText || isReset) {

      let query: ISearchQuery = {
        rawInputValue: queryText,
        enhancedQuery: ''
      };

      this.setState({
        searchInputValue: queryText,
        showClearButton: !isReset
      });

      if (this.props.enableNlpService && this.props.NlpService && queryText) {

        try {

          let enhancedQuery = await this.props.NlpService.enhanceSearchQuery(queryText, this.props.isStaging);
          query.enhancedQuery = enhancedQuery.enhancedQuery;

          enhancedQuery.entities.map((entity) => {          
          });

          this.setState({
            enhancedQuery: enhancedQuery,
          });

        } catch (error) {
          
          // In case of failure, use the non-optimized query instead
          query.enhancedQuery = queryText;  
        }
      }

      if (this.props.searchInNewPage && !isReset) {
        const urlEncodedQueryText = encodeURIComponent(queryText);

        const searchUrl = new URL(this.props.pageUrl);
        if (this.props.queryPathBehavior === QueryPathBehavior.URLFragment) {
          searchUrl.hash = urlEncodedQueryText;
        }
        else {
          searchUrl.searchParams.append(this.props.queryStringParameter, urlEncodedQueryText);
        }

        // Send the query to the new page
        const behavior = this.props.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self';
        window.open(searchUrl.href, behavior);
        
      } else {

        // Notify the dynamic data controller
        this.props.onSearch(query);
      }
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps: ISearchBoxContainerProps) {
    this.setState({
      searchInputValue: decodeURIComponent(nextProps.inputValue),
    });
  }

  public render(): React.ReactElement<ISearchBoxContainerProps> {
    let renderErrorMessage: JSX.Element = null;

    const renderDebugInfos = this.props.enableNlpService && this.props.enableDebugMode ?
                              <NlpDebugPanel rawResponse={ this.state.enhancedQuery }/>:
                              null;

    if (this.state.errorMessage) {
      renderErrorMessage = <MessageBar messageBarType={ MessageBarType.error } 
                                        dismissButtonAriaLabel='Close'
                                        isMultiline={ false }
                                        onDismiss={ () => {
                                          this.setState({
                                            errorMessage: null,
                                          });
                                        }}
                                        className={styles.errorMessage}>
                                        { this.state.errorMessage }</MessageBar>;
    }    
    
    const renderSearchBox = this.props.enableQuerySuggestions ? 
                          this.renderSearchBoxWithAutoComplete() : 
                          this.renderBasicSearchBox();    

    console.log('render executed...');
    
    return (
      <div id="searchbox" className={styles.searchBox}>
        { renderErrorMessage }
        { renderSearchBox }
        { renderDebugInfos }
      </div>
    );
  }

  public componentDidMount(): void {
    this.CssTweak();
    console.log("componentDidMount executed...");
  }

  public componentWillUnmount() {
    const [searchBoxContainer, defaultSearchBox] = new SearchBoxHelper().GetDefaultSearchBoxContainer(this.defaultSearchBoxId);
    
    if (searchBoxContainer != null) {
      var customSearchBoxIdSelector = `[id^='${this.customSearchBoxId}']`;
      var customSearchBox = searchBoxContainer.querySelector(customSearchBoxIdSelector);

      console.log("---> Removing below customSearchBox from searchBoxContainer during component unmount: ");
      console.dir(customSearchBox, {depth: null});

      if (customSearchBox != null) {
        searchBoxContainer.removeChild(customSearchBox);
      }
    }
    
    console.log("ComponentWillUnmount executed...");
  }

  async CssTweak() {
    var defaultSearchBoxId = this.defaultSearchBoxId;
    const customSearchBox = document.getElementById(this.customSearchBoxId);
    customSearchBox.parentElement.parentElement.parentElement.parentElement.setAttribute("style", "background-color: transparent!important;");
    customSearchBox.parentElement.parentElement.parentElement.setAttribute("style", "background-color: transparent!important;");
    
    customSearchBox.style.zIndex = '-999';
    customSearchBox.style.opacity = '0';
    
    const [searchBoxContainerParent, defaultSearchBoxParent] = new SearchBoxHelper().GetDefaultSearchBoxContainer(defaultSearchBoxId);
    
    // disable default searchbox to stop typing in it
    if (defaultSearchBoxParent != null) {
      var defaultSearchBoxInput = defaultSearchBoxParent.getElementsByTagName('input')[0];
      if (defaultSearchBoxInput != null) {
        defaultSearchBoxInput.setAttribute("disabled", "true");
        console.log("Disabled default search box input.");
      }
    }
  
    setTimeout(function() {
      const [searchBoxContainer, defaultSearchBox] = new SearchBoxHelper().GetDefaultSearchBoxContainer(defaultSearchBoxId);
      
      if (searchBoxContainer != null) {
        console.log("Default search box container found.");
        
        searchBoxContainer.setAttribute("style", "display: flex; flex: 1 0 auto; justify-content: center;");

        defaultSearchBox.style.zIndex = '-999';
        defaultSearchBox.style.opacity = '0';
        defaultSearchBox.style.position = 'relative';
        
        searchBoxContainer.appendChild(customSearchBox);
        customSearchBox.style.zIndex = '999';
        customSearchBox.style.opacity = '1';
      } 
      else {
        console.log("Danger - Default search box container not found !!!");
      }
    }, 7000);
  }
}

