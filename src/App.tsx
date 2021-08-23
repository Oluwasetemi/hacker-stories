import * as React from "react";
import axios from "axios";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

const useSemiPersistentState = (key: string, initialState: string) => {
  const [value, setValue] = React.useState<string>(
    localStorage!.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

type State = {
  isLoading: boolean;
  isError: boolean;
  data: any[];
};

type HighLightResult = {
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

type Hits = {
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

type Payload = {
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

type Actions =
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

const storiesReducer = (state: State, action: Actions) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        )
      };
    default:
      throw new Error();
  }
};

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused: boolean;
  children: React.ReactNode;
};

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children
}: InputWithLabelProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

type ListProps = {
  list: Hits[];
  onRemoveItem: (item: Hits) => void;
};

type ItemProps = {
  item: Hits;
  onRemoveItem: (item: Hits) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => (
  <div>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </div>
);

const List = ({ list, onRemoveItem }: ListProps) =>
  list.map((item) => (
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  ));

type SearchFormProps = {
  searchTerm: string | React.Dispatch<React.SetStateAction<string>>;
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit
}: SearchFormProps) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm as string}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </form>
);

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const [stories, dispatchStories] = React.useReducer<
    React.Reducer<State, Actions>
  >(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false
  });

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get<Payload>(url);
      console.log(result);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item: Hits) => {
    console.log(item);
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item
    });
  };

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.SyntheticEvent) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

export default App;
