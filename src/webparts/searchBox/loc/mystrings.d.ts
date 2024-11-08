declare interface ISearchBoxWebPartStrings {
  SearchInputPlaceholder: string;
  SearchInputTitle: string;
  SearchBoxQuerySuggestionsSettings: string;
  SearchBoxEnableQuerySuggestions: string;
  SearchBoxNewPage: string;
  SearchBoxSearchInNewPageLabel: string;
  SearchBoxSearchInNewPageDescription: string;
  SearchBoxPageUrlLabel: string;
  SearchBoxUrlErrorMessage: string;
  SearchBoxQuerySettings: string;
  SearchBoxSameTabOpenBehavior: string;
  SearchBoxNewTabOpenBehavior: string;
  SearchBoxPageOpenBehaviorLabel: string;
  SearchBoxQueryPathBehaviorLabel: string;
  SearchBoxUrlFragmentQueryPathBehavior: string;
  SearchBoxQueryStringQueryPathBehavior: string;
  SearchBoxQueryStringParameterName: string;
  SearchBoxQueryParameterNotEmpty: string;
  SearchBoxQueryNlpSettings: string;
  SearchBoxQueryNlpSettingsDescription: string;
  SearchBoxUserQueryNlpLabel: string;
  SearchBoxServiceUrlLabel: string;
  SearchBoxServiceUrlDescription: string;
  SearchBoxServiceUrlErrorMessage: string;
  SearchBoxUseDebugModeLabel: string;
  SearchBoxUseStagingEndpoint: string;
  SearchBoxPlaceholderTextLabel: string;
  SearchBoxTitleTextLabel: string;
  UrlNotResolvedErrorMessage: string;
  DefaultSearchBoxIdentifierLabel: string;

  DynamicData: {
    UseDynamicDataSourceLabel: string;
    SearchQueryPropertyLabel: string,
    RawInputValuePropertyLabel: string,
    EnhancedQueryPropertyLabel: string,
    DefaultQueryKeywordsPropertyLabel: string;
  },
  DebugPanel: {
    HeaderLabel: string;
    DetectedLanguageLabel: string;
    RecognizedEntitiesLabel: string;
    TopScoringIntentNameLabel: string;
    TopScoringIntentScoreLabel: string;
    EnhancedQueryLabel: string;
    AlteredQueryLabel: string;
  }
}

declare module 'SearchBoxWebPartStrings' {
  const strings: ISearchBoxWebPartStrings;
  export = strings;
}
