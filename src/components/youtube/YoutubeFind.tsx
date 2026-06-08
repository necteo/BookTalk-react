import { Fragment, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from './youtubeApi';

const YoutubeFind = () => {
  const [fd, setFd] = useState('개발자');
  const [searchTerm, setSearchTerm] = useState(fd);
  const fdRef = useRef<HTMLInputElement>(null);
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['youtube', searchTerm],
    queryFn: async () => await youtubeApi(searchTerm),
    enabled: !!searchTerm,
  });

  const findClick = () => {
    if (!fd.trim()) {
      fdRef.current?.focus();
      return null;
    }
    setSearchTerm(fd.trim());
  };


  if (isLoading) {
    return <h1 className="text-center">Loading...</h1>;
  }
  if (isError) {
    return <h1 className="text-center">Error: {error.message}</h1>;
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
                <h2>Youtube 동영상 검색</h2>
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
                    동영상검색
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
              />
              <button className="btn-sm btn-primary" onClick={findClick}>
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="archive-area section_padding_80">
        <div className="container">
          <div className="row">
            {data?.items?.map((item, index) => (
              <div className="col-12 col-md-6 mb-4" key={index}>
                <div
                  className="single-post h-100"
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <div className="post-thumb">
                    <iframe
                      src={'https://www.youtube.com/embed/' + item.id.videoId}
                      title={item.snippet.title}
                      allowFullScreen={true}
                      style={{
                        width: '100%',
                        height: '240px',
                        display: 'block',
                        border: 'none',
                      }}
                    />
                  </div>
                  <div
                    className="post-content"
                    style={{ padding: '12px 16px' }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: '15px',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.snippet.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default YoutubeFind;
