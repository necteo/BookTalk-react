import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookListData } from '../../commons/commonsData';
import apiClient from '../../http-commons';
import PagePrint from '../../commons/PagePrint';
import { Link } from 'react-router-dom';

const BookList = () => {
  const [curpage, setCurpage] = useState<number>(1);
  const { isLoading, isError, error, data } = useQuery<{ data: BookListData }>({
    queryKey: ['book-list' + curpage],
    queryFn: async () => {
      return await apiClient.get(`/api/book/list/${curpage}`);
    },
  });

  if (isLoading) {
    return <h1 className="text-center">Loading...</h1>;
  }
  if (isError) {
    return <h1 className="text-center">Error 발생: {error?.message}</h1>;
  }

  return (
    <Fragment>
      <div className="breadcumb-nav">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">책</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    전체보기
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <section className="archive-area section_padding_80">
        <div className="container">
          <div className="row">
            {data?.data.list &&
              data.data.list.map((book, index) => (
                <div className="col-12 col-md-6 col-lg-4" key={index}>
                  <div
                    className="single-post wow fadeInUp"
                    data-wow-delay="0.1s"
                  >
                    <div className="post-thumb">
                      <Link to={`/book/detail/${book.isbn}`}>
                        <img src={book.poster} alt="" />
                      </Link>
                    </div>
                    <div className="post-content">
                      <div className="post-meta d-flex">
                        <div className="post-title-author-area d-flex">
                          <div className="post-title">
                            <Link to={`/book/detail/${book.isbn}`}>{book.title}</Link>
                          </div>
                          <div className="post-author">
                            {book.author}
                          </div>
                        </div>
                      </div>
                      <h4 className="post-price">
                        {book.price.toLocaleString()}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            <div className="col-12">
              <div className="pagination-area">
                {data?.data && (
                  <PagePrint pageData={data.data} setCurpage={setCurpage} />
                )}
                <div className="page-status">
                  <p>
                    Page {curpage} of {data?.data.totalpage} results
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default BookList;
