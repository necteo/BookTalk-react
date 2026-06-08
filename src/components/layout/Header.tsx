import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Header = () => {
  const { isLoggedIn, isLoading, member, logout } = useAuth();

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 text-right">
          {isLoading ? (
            <span>로딩 중...</span>
          ) : !isLoggedIn ? (
            <div className="login">
              <Link to="/login">
                <button className="btn-sm btn-primary">로그인</button>
              </Link>
            </div>
          ) : (
            <div className="login">
              {member?.picture && (
                <img
                  src={member.picture}
                  alt="프로필"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    marginRight: 6,
                  }}
                />
              )}
              {member?.name}님 로그인 중입니다
              <button className="btn-sm btn-danger" onClick={logout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="col-12">
        <nav className="navbar">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/">Home</Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="yummyDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                책
              </a>
              <div className="dropdown-menu" aria-labelledby="yummyDropdown">
                <Link className="dropdown-item" to="/book/list">
                  전체보기
                </Link>
              </div>
            </li>
            <li className="nav-item">
              <Link to="board/list">게시판</Link>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button">
                검색
              </a>
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="/youtube/find">
                  유튜브 검색
                </Link>
                <Link className="dropdown-item" to="/news/find">
                  뉴스 검색
                </Link>
              </div>
            </li>
            {isLoggedIn && (
              <li className="nav-item">
                <Link className="nav-link" to="/chat/chatbot">
                  챗봇
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Header;
