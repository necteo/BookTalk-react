import { Link, useNavigate, useNavigationType, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import boardClient from "../../board-commons";

interface BoardDetailProps {
  NO: number;
  NAME: string;
  SUBJECT: string;
  CONTENT: string;
  DBDAY: string;
  HIT: number;
}

const BoardDetail = () => {
  const { no } = useParams();
  const nav = useNavigate();
  const type = useNavigationType();

  const { isLoading, isError, error, data } = useQuery<{ data: BoardDetailProps }>({
    queryKey: ['board-detail', no],
    queryFn: async () =>
      await boardClient.get(`/board/detail-node?no=${no}`)
    // /board/detail?no=1  => req.query.no => @RequestParameter => 매개변수
    // /board/detail/1     => req.params.no => @PathVariable
  });

  if (isLoading) {
    return <h1 className="text-center">Loading...</h1>;
  }
  if (isError) {
    return <h1 className="text-center">Error발생: {error.message}</h1>;
  }

  const board = data?.data;
  if (!board) {
    return null;
  }

  return (
    <Fragment>
      <div className="breadcumb-area" style={{ backgroundImage: "url(/img/bg-img/breadcumb.jpg)" }}>
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-12">
              <div className="bradcumb-title text-center">
                <h2>React-Query+TypeScript 상세보기</h2>
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
                  <li className="breadcrumb-item">게시판</li>
                  <li className="breadcrumb-item active" aria-current="page">상세보기</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <section className="archive-area section_padding_80">
        <div className="container">
          <div className="row" style={{ margin: "0 auto" }}>
            <table className="table">
              <tbody>
              <tr>
                <td width="20%" className="text-center bg-danger">번호</td>
                <td width="30%" className="text-center">{board.NO}</td>
                <td width="20%" className="text-center bg-danger">작성일</td>
                <td width="30%" className="text-center">{board.DBDAY}</td>
              </tr>
              <tr>
                <td width="20%" className="text-center bg-danger">이름</td>
                <td width="30%" className="text-center">{board.NAME}</td>
                <td width="20%" className="text-center bg-danger">조회수</td>
                <td width="30%" className="text-center">{board.HIT}</td>
              </tr>
              <tr>
                <td width="20%" className="text-center bg-danger">제목</td>
                <td colSpan={3}>{board.SUBJECT}</td>
              </tr>
              <tr>
                <td colSpan={4} className="text-left" valign="top" height="200">
                  <pre style={{ whiteSpace:"pre-wrap", backgroundColor: "white", border: "none" }}>{board.CONTENT}</pre>
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="text-right">
                  <Link to={`/board/update/${no}`} className="btn btn-sm btn-success">수정</Link>&nbsp;
                  <Link to={`/board/delete/${no}`} className="btn btn-sm btn-warning">삭제</Link>&nbsp;
                  <Link to="/board/list" className="btn btn-sm btn-primary">목록</Link>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Fragment>
  )
}

export default BoardDetail;