export type State = {
    isLoading: boolean;
    isError: boolean;
    data: any[];
};

export type HighLightResult = {
    title: {
        value: string;
        matchLevel: string;
        fullyHighlighted: boolean;
        matchWords: string[];
    };
    url: {
        value: string;
        matchLevel: string;
        fullyHighlighted: boolean;
        matchedWords: string[];
    };
    author: {
        value: string;
        matchLevel: string;
        matchedWords: string[];
    };
};

export type Hits = {
    created_at: Date;
    title: string;
    url: string;
    author: string;
    points: number;
    story_text: string | null;
    comment_text: string | null;
    num_comments: number;
    story_id?: string | null;
    story_title?: string | null;
    story_url?: string | null;
    parent_id?: string | null;
    created_at_i: number;
    relevancy_score?: number;
    _tags?: string[];
    objectID: string;
    _highlightResult?: HighLightResult;
};

export type Payload = {
    hits: Hits[];
    nbHits?: number;
    page?: number;
    nbPages?: number;
    hitsPerPage?: number;
    exhaustiveNbHits?: boolean;
    query?: string;
    params?: string;
    processingTimeMS?: number;
};

export type InputWithLabelProps = {
    id: string;
    value: string;
    type?: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isFocused: boolean;
    children: React.ReactNode;
};

export type SearchFormProps = {
    searchTerm: string;
    onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
};

export type ListProps = {
    list: Hits[];
    onRemoveItem: (item: Hits) => void;
};

export type ItemProps = {
    item: Hits;
    onRemoveItem: (item: Hits) => void;
};

export type Actions =
    | {
        type: "STORIES_FETCH_INIT";
    }
    | { type: "STORIES_FETCH_SUCCESS"; payload: Hits[] }
    | { type: "STORIES_FETCH_FAILURE" }
    | {
        type: "REMOVE_STORY";
        payload: {
            objectID: string;
        };
    };