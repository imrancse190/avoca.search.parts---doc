import { PageOpenBehavior, QueryPathBehavior } from '../../../../helpers/UrlHelper';
import ISearchService from       '../../../../services/SearchService/ISearchService';
import INlpService from '../../../../services/NlpService/INlpService';
import ISearchQuery from '../../../../models/ISearchQuery';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ISearchBoxContainerProps {
    onSearch: (searchQuery: ISearchQuery) => void;
    searchInNewPage: boolean;
    enableQuerySuggestions: boolean;
    enableNlpService: boolean;
    searchService: ISearchService;
    pageUrl: string;
    openBehavior: PageOpenBehavior;
    queryPathBehavior: QueryPathBehavior;
    queryStringParameter: string;
    inputValue: string;
    NlpService: INlpService;
    enableDebugMode: boolean;
    isStaging: boolean;
    placeholderText: string;
    searchboxtitleText: string;
    defaultSearchBoxIdentifier: string;
    domElement: HTMLElement;
    context:WebPartContext;
}
