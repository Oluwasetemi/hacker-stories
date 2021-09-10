import axios from 'axios';
import * as React from 'react';
import type {
	Actions,
	Hits,
	InputWithLabelProps,
	ItemProps,
	ListProps,
	Payload,
	SearchFormProps,
	State,
} from './types';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (
	key: string,
	initialState: string,
): [string, (v: string) => void] => {
	const [value, setValue] = React.useState(
		localStorage!.getItem(key) || initialState,
	);

	React.useEffect(() => {
		localStorage.setItem(key, value);
	}, [value, key]);

	return [value, setValue];
};

const storiesReducer = (state: State, action: Actions): State => {
	switch (action.type) {
		case 'STORIES_FETCH_INIT':
			return {
				...state,
				isLoading: true,
				isError: false,
			};
		case 'STORIES_FETCH_SUCCESS':
			return {
				...state,
				isLoading: false,
				isError: false,
				data: action.payload,
			};
		case 'STORIES_FETCH_FAILURE':
			return {
				...state,
				isLoading: false,
				isError: true,
			};
		case 'REMOVE_STORY':
			return {
				...state,
				data: state.data.filter(
					story => action.payload.objectID !== story.objectID,
				),
			};
		default:
			throw new Error();
	}
};

const InputWithLabel = ({
	id,
	value,
	type = 'text',
	onInputChange,
	isFocused,
	children,
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
	<React.Fragment>
		{list.map(item => (
			<Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
		))}
	</React.Fragment>

const SearchForm = ({
	searchTerm,
	onSearchInput,
	onSearchSubmit,
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
	const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

	const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

	const [stories, dispatchStories] = React.useReducer(storiesReducer, {
		data: [],
		isLoading: false,
		isError: false,
	});

	const handleFetchStories = React.useCallback(async () => {
		dispatchStories({ type: 'STORIES_FETCH_INIT' });

		try {
			const result = await axios.get<Payload>(url);
			console.log(result);

			dispatchStories({
				type: 'STORIES_FETCH_SUCCESS',
				payload: result.data.hits,
			});
		} catch {
			dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
		}
	}, [url]);

	React.useEffect(() => {
		handleFetchStories();
	}, [handleFetchStories]);

	const handleRemoveStory = (item: Hits) => {
		console.log(item);
		dispatchStories({
			type: 'REMOVE_STORY',
			payload: item,
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
