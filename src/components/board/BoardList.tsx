import { Fragment, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import boardClient from '../../board-commons';

interface BoardItem {
  NO: number;
  SUBJECT: string;
  NAME: string;
  DBDAY: string;
  HIT: number;
}

interface BoardListResponse {
  list: BoardItem[];
  curpage: number;
  totalpage: number;
}

const BoardList = () => {
  const [curpage, setCurpage] = useState(1);

  const {
    isLoading,
    isError,
    error,
    data,
    refetch: hitIncrement,
  } = useQuery<{ data: BoardListResponse }>({
    queryKey: ['board-list', curpage],
    queryFn: async () =>
      await boardClient.get(`board/list-node?page=${curpage}`),
  });

  useEffect(() => {
    hitIncrement();
  }, [hitIncrement]);

  if (isLoading) {
    return <h1 className="text-center">Loading...</h1>;
  }
  if (isError) {
    return <h1 className="text-center">Error발생: {error.message}</h1>;
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
                <h2>React-Query+TypeScript 게시판</h2>
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
                  <li className="breadcrumb-item">커뮤니티</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    게시판
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
            <table className="table">
              <tbody>
                <tr>
                  <td>
                    <Link to="/board/insert" className="btn btn-sm btn-primary">
                      새글
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="table">
              <thead>
                <tr className="success">
                  <th className="text-center">번호</th>
                  <th className="text-center">제목</th>
                  <th className="text-center">이름</th>
                  <th className="text-center">작성일</th>
                  <th className="text-center">조회수</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.list.map((board) => (
                  <tr key={board.NO}>
                    <td className="text-center">{board.NO}</td>
                    <td>
                      <Link to={`/board/detail/${board.NO}`}>
                        {board.SUBJECT}
                      </Link>
                    </td>
                    <td className="text-center">{board.NAME}</td>
                    <td className="text-center">{board.DBDAY}</td>
                    <td className="text-center">{board.HIT}</td>
                  </tr>
                ))}
                <tr>
                  <td className="text-center" colSpan={5}>
                    {curpage > 1 && (
                      <button
                        className="btn-sm btn-success"
                        onClick={() => setCurpage(curpage - 1)}
                      >
                        이전
                      </button>
                    )}
                    &nbsp;{data?.data.curpage} page / {data?.data.totalpage}{' '}
                    pages&nbsp;
                    {curpage < (data?.data.totalpage ?? 1) && (
                      <button
                        className="btn-sm btn-success"
                        onClick={() => setCurpage(curpage + 1)}
                      >
                        다음
                      </button>
                    )}
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

export default BoardList;
