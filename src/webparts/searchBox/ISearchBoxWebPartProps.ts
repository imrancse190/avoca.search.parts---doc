import { PageOpenBehavior, QueryPathBehavior } from '../../helpers/UrlHelper';
import { DynamicProperty } from '@microsoft/sp-component-base';

interface ISearchBoxWebPartProps {
    searchInNewPage: boolean;
    pageUrl: string;
    queryPathBehavior: QueryPathBehavior;
    queryStringParameter: string;
    openBehavior: PageOpenBehavior;
    enableQuerySuggestions: boolean;
    useDynamicDataSource: boolean;
    NlpServiceUrl: string;
    enableNlpService: boolean;
    enableDebugMode: boolean;
    isStaging: boolean;
    defaultQueryKeywords: DynamicProperty<string>;
    placeholderText: string;
    searchboxtitleText: string;
    defaultSearchBoxIdentifier: string;
}

export default ISearchBoxWebPartProps;