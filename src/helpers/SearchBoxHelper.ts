
export class SearchBoxHelper {
  
    public GetDefaultSearchBoxContainer(defaultSearchBoxId: string) {
        var defaultSearchBox = document.getElementById(defaultSearchBoxId);
        if (defaultSearchBox == null) {
            defaultSearchBox = document.querySelector(defaultSearchBoxId); // Fallback checking
        }

        if (defaultSearchBox != null) {
            const searchBoxContainer = defaultSearchBox.parentElement.parentElement.parentElement;
            if (searchBoxContainer != null) {
                return [searchBoxContainer, defaultSearchBox];
            }
        }
        
        return [null, null];
    }
}