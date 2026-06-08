export interface BookItem {
  isbn: string;
  title: string;
  poster: string;
  author: string;
  price: number;
}

export interface MainPageData {
  main: BookItem;
  newList: BookItem[];
  hitList: BookItem[];
}

export interface BookListData {
  list: BookItem[];
  curpage: number;
  totalpage: number;
  startPage: number;
  endPage: number;
}

export interface BookDetail {
  isbn: string;
  title: string;
  author: string;
  translator: string;
  page: number;
  price: number;
  pubdate: string;
  series: string;
  type: string;
  link: string;
  hit: number;
  poster: string;
}

export interface CommentData {
  no: number;
  isbn: string;
  id: number;
  name: string;
  msg: string;
  dbday: string;
}

export interface BookDetailProps {
  detail: BookDetail;
  comments: CommentData[];
}

export interface YoutubeItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnail: {
      medium: {
        url: string;
      };
    };
  };
}

export interface YoutubeResponse {
  items: YoutubeItem[];
}
