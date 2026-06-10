import { useMutation, useQuery } from '@tanstack/react-query';
import { Fragment, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../http-commons';
import { BookDetailProps } from '../../commons/commonsData';
import { AxiosResponse } from 'axios';
import { useAuth } from '../auth/AuthContext';

const BookDetail = () => {
  const { isbn } = useParams();
  const nav = useNavigate();
  const { member } = useAuth();

  const [isInserting, setIsInserting] = useState(true);
  const [no, setNo] = useState(0);
  // 추가
  const [msg, setMsg] = useState('');
  const msgRef = useRef<HTMLTextAreaElement>(null);

  // 수정
  const [umsg, setUmsg] = useState('');
  const umsgRef = useRef<HTMLTextAreaElement>(null);

  const {
    isLoading,
    isError,
    error,
    data,
    refetch: refetchBookDetail,
  } = useQuery<{ data: BookDetailProps }>({
    queryKey: ['book-detail', isbn],
    queryFn: async () => {
      return await apiClient.get(`/api/book/detail/${isbn}`);
    },
  });

  // insert
  const { mutate: commentInsert } = useMutation<BookDetailProps>({
    mutationFn: async () => {
      const res: AxiosResponse<BookDetailProps, Error> = await apiClient.post(
        `/api/comment/insert`,
        {
          // 작성자는 서버가 JWT로 결정 — id/name 안 보냄
          isbn: isbn,
          msg: msg,
        },
      );
      return res.data;
    },
    onSuccess: (data: BookDetailProps) => {
      refetchBookDetail();
      if (msgRef.current) {
        setMsg('');
        msgRef.current.focus();
      }
    },
    onError: (err: Error) => {
      console.error('Error발생:', err.message);
    },
  });

  const { mutate: commentDelete } = useMutation<BookDetailProps>({
    mutationFn: async () => {
      const res: AxiosResponse<BookDetailProps, Error> = await apiClient.delete(
        `/api/comment/delete/${no}`,
      );
      return res.data;
    },
    onSuccess: (data: BookDetailProps) => {
      refetchBookDetail();
    },
    onError: (err: Error) => {
      console.error('Error발생 :', err.message);
    },
  });

  const { mutate: commentUpdate } = useMutation<BookDetailProps>({
    mutationFn: async () => {
      const res: AxiosResponse<BookDetailProps, Error> = await apiClient.put(
        '/api/comment/update',
        {
          no: no,
          msg: umsg,
        },
      );
      return res.data;
    },
    onSuccess: (data: BookDetailProps) => {
      refetchBookDetail();
      if (umsgRef.current) {
        setUmsg('');
      }
      setIsInserting(true);
    },
    onError: (err: Error) => {
      console.error('Error발생 :', err.message);
    },
  });

  if (isLoading) {
    return <h1 className="text-center">Loading...</h1>;
  }
  if (isError) {
    return <h1 className="text-center">Error 발생: {error?.message}</h1>;
  }

  const bookDetail = data?.data.detail;
  const comment = data?.data.comments;
  // 이벤트 처리
  const insert = () => {
    if (msg === '') {
      msgRef.current?.focus();
      return;
    }
    commentInsert();
  };

  const del = (no: number) => {
    setNo(no);
    commentDelete();
  };

  const updateData = (no: number, index: number) => {
    if (umsgRef.current && comment) {
      setUmsg(comment[index].msg);
      umsgRef.current.focus();
    }
    setIsInserting(false);
    setNo(no);
  };

  const update = () => {
    if (umsg === '') {
      umsgRef.current?.focus();
      return;
    }
    commentUpdate();
  };

  return (
    <Fragment>
      <div className="breadcumb-nav">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">책</li>
                  <li className="breadcrumb-item">전체보기</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    책 상세
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
                  <td className="text-center" rowSpan={9} width="30%">
                    <img
                      src={bookDetail?.poster}
                      alt=""
                      style={{ width: '350px', height: '300px' }}
                    />
                  </td>
                  <td colSpan={2}>
                    <h3>{bookDetail?.title}</h3>
                  </td>
                </tr>
                <tr>
                  <td className="text-center" width="15%">
                    지은이
                  </td>
                  <td width="55%">{bookDetail?.author}</td>
                </tr>
                {bookDetail?.translator && (
                  <tr>
                    <td className="text-center" width="15%">
                      옮긴이
                    </td>
                    <td width="55%">{bookDetail.translator}</td>
                  </tr>
                )}
                <tr>
                  <td className="text-center" width="15%">
                    페이지
                  </td>
                  <td width="55%">{bookDetail?.page}</td>
                </tr>
                <tr>
                  <td className="text-center" width="15%">
                    가격
                  </td>
                  <td width="55%">{bookDetail?.price}</td>
                </tr>
                <tr>
                  <td className="text-center" width="15%">
                    ISBN
                  </td>
                  <td width="55%">{bookDetail?.isbn}</td>
                </tr>
                <tr>
                  <td className="text-center" width="15%">
                    발행일
                  </td>
                  {/*HTML로 파싱 dangerouslySetInnerHTML*/}
                  <td width="55%">{bookDetail?.pubdate}</td>
                </tr>
                <tr>
                  <td className="text-center" width="15%">
                    시리즈
                  </td>
                  <td width="55%">{bookDetail?.series}</td>
                </tr>
                <tr>
                  <td className="text-center" width="15%">
                    유형
                  </td>
                  <td width="55%">{bookDetail?.type}</td>
                </tr>
              </tbody>
            </table>
            {/* 지도 
            <table className="table">
              <tbody>
              <tr>
                <td className="text-center">
                  <MapPrint address={jejuData?.address ?? ''} name={jejuData?.title ?? ''} />
                </td>
              </tr>
              </tbody>
            </table>*/}
            {/* 댓글 */}
            <table className="table">
              <tbody>
                <tr>
                  <td className="text-left">
                    <h3>[리뷰]</h3>
                  </td>
                </tr>
                <tr>
                  <td>
                    {comment &&
                      comment.map((com, index) => (
                        <table className="table" key={index}>
                          <tbody>
                            <tr>
                              <td className="text-left" width="80%">
                                ◐{com.name}({com.dbday})
                              </td>
                              <td className="text-right" width="20%">
                                {com.id === member?.id && (
                                  <span>
                                    <button
                                      className="btn-sm btn-warning"
                                      onClick={() => updateData(com.no, index)}
                                    >
                                      수정
                                    </button>
                                    &nbsp;
                                    <button
                                      className="btn-sm btn-warning"
                                      onClick={() => del(com.no)}
                                    >
                                      삭제
                                    </button>
                                  </span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2} valign="top">
                                <pre
                                  style={{
                                    whiteSpace: 'pre-wrap',
                                    backgroundColor: 'white',
                                    border: 'none',
                                  }}
                                >
                                  {com.msg}
                                </pre>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      ))}
                  </td>
                </tr>
              </tbody>
            </table>
            {member?.id &&
              (isInserting ? (
                <table className="table">
                  <tbody>
                    <tr>
                      <td>
                        <textarea
                          rows={4}
                          cols={120}
                          style={{ float: 'left' }}
                          ref={msgRef}
                          value={msg}
                          onChange={(e) => setMsg(e.target.value)}
                        ></textarea>
                        <button
                          className="btn-sm btn-primary"
                          style={{
                            float: 'left',
                            width: '100px',
                            height: '100px',
                          }}
                          onClick={insert}
                        >
                          댓글쓰기
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="table">
                  <tbody>
                    <tr>
                      <td>
                        <textarea
                          rows={4}
                          cols={120}
                          style={{ float: 'left' }}
                          ref={umsgRef}
                          value={umsg}
                          onChange={(e) => setUmsg(e.target.value)}
                        ></textarea>
                        <button
                          className="btn-sm btn-primary"
                          style={{
                            float: 'left',
                            width: '100px',
                            height: '100px',
                          }}
                          onClick={update}
                        >
                          댓글수정
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ))}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default BookDetail;
