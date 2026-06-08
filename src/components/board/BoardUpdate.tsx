import { Fragment, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import boardClient from "../../board-commons";
import { AxiosResponse } from "axios";
/*
     1. React 개념
        => 이론 / 실습
        => state(상태)에 따라 UI를 선언적으로 표현하는 컴포넌트 기반 라이브러리
           데이터 변경
           1) 컴포넌트 기반 UI
           2) 가상돔 이용
           3) 데이터변경 시 자동 렌더링
     2. state  / props
                 => 전송을 받는 경우
                 => 데이터 변경이 불가능
                    <MapPrint address="" name="">
                 => function A(props)
                 => props.address
        => 컴포넌트 내부 : useState => HTML에 반영
        => 필요시에 변경이 가능
        => 서버나 외부에서 들어오는 값을 관리 : 상태 관리
     3. useEffect(()=>{
           언제 실행되는지
        },[deps])
        => [] => mount() => window.onload일시에 1회 실행
        => [curpage] => curpage변경이 될때마다 수행
     4. 가상 돔 : vue / react
        => 성능의 최적화
        => state가 변경시마다 diff를 이용한 최소 렌더링
     5. tanStack-Query : 사용 이유
        => 서버 상태 / 클라이언트 상태
        => 서버의 데이터 전송 상태를 곤리
        => 캐싱 / 자동 refetch / loading.error 관리 가능
        => 중복 요청 방지 => [] 키 => queryKey
        => 비동기
     --------------------------------------------------
     6. staleTime / cacheTime
                    => 메모리에 남아 있는 시간 => 시간이 지나면 자동 삭제
        => 새로운 데이터 저장 시간
     7. useQuery / useMutation
                   => 호출시에만 사용이 가능 (POST,DELET,PUT)
        => 자동 실행 : GET
     8. NodeJS
        비동기 이벤트 구조 동시 요청 처리가 가능 => 서버사이드 (Front의 백엔드)
        CORS : 다른 포트 허용
     --------------------------------------------------
     Spring / Spring-Boot 차이점
              | application.yml 역할
     Thymeleaf / JSP => jar/war
     Mybatis / JPA
     --------------------------------------------------
     Docker / Jenkins => CI/CD의 흐름
      => 실행환경이 동일 / 빌드 자동화
       | image / container
         | 클래스 | 객체
       | Docker Compose
 */
interface BoardItem {
  NO: number;
  NAME: string;
  SUBJECT: string;
  CONTENT: string;
}
// res.json({msg:'yes'})
interface BoardResponse {
  msg: string;
}

const BoardUpdate = () => {
  const { no } = useParams();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [pwd, setPwd] = useState('');
  // v-model
  const nameRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const pwdRef = useRef<HTMLInputElement>(null);
  // HTML에 적용

  // 1. 데이터 읽기 (useQuery)
  const { isLoading, isError, error, data } = useQuery<{ data: BoardItem }>({
    queryKey: ['board-update', no],
    queryFn: async () =>
      await boardClient.get(`/board/update-node?no=${no}`)
  });
  const board = data?.data;

  useEffect(() => {
    if (board) {
      setName(board.NAME);
      setSubject(board.SUBJECT);
      setContent(board.CONTENT);
    }
  }, [board])

  // 2. 수정 => 실제 수정 (useMutation) => req.body
  const { mutate: boardUpdate } = useMutation({
    mutationFn: async () =>
      await boardClient.put('/board/update-ok-node', {
        no: no,
        name: name,
        subject: subject,
        content: content,
        pwd: pwd
      }),
    onSuccess: async (res: AxiosResponse<BoardResponse>) => {
      if (res.data.msg === 'yes') { // 비밀번호가 일치
        window.location.href = `/board/detail/${no}`;
      } else { // 비밀번호 틀린 상태
        alert('비밀번호가 틀립니다');
        setPwd('');
        pwdRef.current?.focus();
      }
    },
    onError: async (err) => {
      console.error(err.message);
    }
  });

  const boardUpdateOk = () => {
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    if (!subject.trim()) {
      subjectRef.current?.focus();
      return;
    }
    if (!content.trim()) {
      contentRef.current?.focus();
      return;
    }
    if (!pwd.trim()) {
      pwdRef.current?.focus();
      return;
    }
    boardUpdate();
  }

  if (isLoading) {
    return <h1 className="text-center">Loading...</h1>;
  }
  if (isError) {
    return <h1 className="text-center">Error발생: {error.message}</h1>;
  }
  return (
    <Fragment>
      <div className="breadcumb-area" style={{ backgroundImage: "url(/img/bg-img/breadcumb.jpg)" }}>
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-12">
              <div className="bradcumb-title text-center">
                <h2>React-Query+TypeScript 수정하기</h2>
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
                  <li className="breadcrumb-item active" aria-current="page">수정하기</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <section className="archive-area section_padding_80">
        <div className="container">
          <div className="row" style={{ width: "600px", margin: "0 auto" }}>
            <table className="table">
              <tbody>
              <tr>
                <td width="15%">이름</td>
                <td width="85%">
                  <input type="text" size={15} className="input-sm" ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td width="15%">제목</td>
                <td width="85%">
                  <input type="text" size={55} className="input-sm" ref={subjectRef} value={subject} onChange={(e) => setSubject(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td width="15%">내용</td>
                <td width="85%">
                  <textarea rows={10} cols={55} ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                </td>
              </tr>
              <tr>
                <td width="15%">비밀번호</td>
                <td width="85%">
                  <input type="password" size={15} className="input-sm" ref={pwdRef} value={pwd} onChange={(e) => setPwd(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="text-center">
                  <button className="btn-sm btn-primary" onClick={boardUpdateOk}>수정</button>
                  <button className="btn-sm btn-primary" onClick={() => nav(-1)}>취소</button>
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

export default BoardUpdate;