import React, { Fragment, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import boardClient from '../../board-commons';

interface NewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NewsItem[];
}

const NewsFind = () => {
  const [fd, setFd] = useState('개발');
  const [searchTerm, setSearchTerm] = useState(fd);
  const fdRef = useRef<HTMLInputElement>(null);
  // 서버 연결
  const { isLoading, isError, error, data } = useQuery<
    AxiosResponse<NewsResponse>,
    Error
  >({
    queryKey: ['news-find', searchTerm],
    queryFn: async () => {
      return await boardClient.get(`/news/find-node?query=${searchTerm}`);
    },
    enabled: !!searchTerm,
  });

  const find = () => {
    if (!fd.trim()) {
      fdRef.current?.focus();
      return;
    }
    setSearchTerm(fd);
  };

  const keyDownFind = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      find();
    }
  };

  if (isLoading) {
    return <h1 className="text-center">Loading...</h1>;
  }
  if (isError) {
    return <h1 className="text-center">Error: {error?.message}</h1>;
  }
  return (
    <Fragment>
      <div
        className="breadcumb-area"
        style={{ backgroundImage: 'url(/img/bg-img/breadcumb.jpg)' }}
      >
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-12">
              <div className="bradcumb-title text-center">
                <h2>네이버 뉴스 검색</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="breadcumb-nav">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">검색</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    뉴스검색
                  </li>
                </ol>
              </nav>
            </div>
            <div className="col-12">
              <input
                type="text"
                size={20}
                className="input-sm"
                ref={fdRef}
                value={fd}
                onChange={(e) => setFd(e.target.value)}
                onKeyDown={keyDownFind}
              />
              <button className="btn-sm btn-primary" onClick={find}>
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="archive-area section_padding_80">
        <div className="container">
          <div className="row" style={{ width: '900px', margin: '0 auto' }}>
            <table className="table">
              <tbody>
                <tr>
                  <td>
                    {data?.data.items &&
                      data.data.items.map((item, index) => (
                        <table className="table table-striped" key={index}>
                          <tbody>
                            <tr>
                              <td>
                                <a
                                  target="_blank"
                                  rel="noreferrer"
                                  href={item.link}
                                >
                                  <h3
                                    style={{ color: 'orange' }}
                                    dangerouslySetInnerHTML={{
                                      __html: item.title,
                                    }}
                                  ></h3>
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td
                                dangerouslySetInnerHTML={{
                                  __html: item.description,
                                }}
                              ></td>
                            </tr>
                          </tbody>
                        </table>
                      ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default NewsFind;
