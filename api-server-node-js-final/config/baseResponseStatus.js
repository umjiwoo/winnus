module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },
    SEND_VERIFICATION_MSG_SUCCESS:{"isSuccess": true, "code": 1002, "message":"인증번호 전송 성공" },
    VERIFY_SUCCESS:{"isSuccess": true, "code": 1003, "message":"휴대폰 번호 인증 성공"},
    POST_REVIEW_SUCCESS:{"isSuccess": true, "code": 1004, "message":"리뷰 작성 성공" },
    SUBSCRIBE_SUCCESS:{"isSuccess": true, "code": 1005, "message":"와인 찜 등록 성공" },
    UNSUBSCRIBE_SUCCESS:{"isSuccess": true, "code": 1005, "message":"와인 찜 해제 성공" },
    DELETE_ALL_SEARCHED_KEYWORD_SUCCESS:{"isSuccess": true, "code": 1006, "message":"검색 기록 전체 삭제 성공"},
    UPDATE_USER_INFO_SUCCESS:{"isSuccess": true, "code": 1007, "message":"사용자 정보 수정 성공"},
    USER_WITHDRAW_SUCCESS:{"isSuccess": true, "code": 1008, "message":"사용자 탈퇴 성공"},

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" },

    //Request error
    ENTER_NICKNAME_TO_SIGN_UP:{"isSuccess": false, "code": 2001, "message":"회원가입을 위해 닉네임을 입력해주세요."},
    ENTER_PHONENUM_TO_SIGN_UP:{"isSuccess": false, "code": 2002, "message":"회원가입을 위해 전화번호를 입력해주세요."},
    ENTER_PASSWORD_TO_SIGN_UP:{"isSuccess": false, "code": 2003, "message":"회원가입을 위해 비밀번호를 입력해주세요."},
    NICKNAME_LENGTH_OVER:{"isSuccess": false, "code": 2004, "message":"닉네임은 최대 20자까지 가능합니다."},
    PHONE_REGEX_WRONG:{"isSuccess": false, "code": 2005, "message":"전화번호 형식이 올바르지 않습니다. - 기호는 들어가지 않습니다."},
    PASSWORD_REGEX_WRONG:{"isSuccess": false, "code": 2006, "message":"비밀번호 형식은 대문자,소문자,숫자 혼합 8자 이상 32자 이하입니다."},


    ENTER_PHONE_NUMBER_TO_VERIFY:{"isSuccess": false, "code": 2009, "message":"인증을 위해 전화번호를 입력해주세요."},
    ENTER_GIVEN_VERIFYING_NUMBER:{"isSuccess": false, "code": 2010, "message":"인증을 위해 전달받은 인증번호를 입력해주세요."},

    ENTER_PHONENUM_TO_SIGN_IN:{"isSuccess": false, "code": 2011, "message": "로그인 휴대폰 번호를 입력해주세요."},
    ENTER_PASSWORD_TO_SIGN_IN:{ "isSuccess": false, "code": 2012, "message":"로그인 비밀번호를 입력해주세요."},

    WINE_ID_NULL:{ "isSuccess": false, "code": 2030, "message":"검색할 와인 인덱스를 입력해주세요."},

    SELECT_THEME_TO_GET:{ "isSuccess": false, "code": 2031, "message":"조회할 테마를 선택해주세요."},

    ENTER_WINE_NAME:{"isSuccess": false, "code": 2032, "message":"검색할 와인 이름을 입력해주세요."},
    ENTER_WINE_SEARCH_KEYWORD:{"isSuccess": false, "code": 2032, "message":"검색 키워드를 입력해주세요."},

    ENTER_WILLING_TO_SUBSCRIBE_WINE_ID:{ "isSuccess": false, "code": 2033, "message":"찜할 와인 인덱스를 입력해주세요."},

    TASTE_LIST_EMPTY:{"isSuccess": false, "code": 2034, "message":"맛(당도,산도,바디감,타닌감)은 필수 선택 요소입니다."},

    GOTO_WINE_SEARCH:{"isSuccess": false, "code": 2035, "message":"와인 검색 탭에서 검색해주세요."},

    ENTER_SHOP_ID_TO_SHOW:{"isSuccess": false, "code": 2036, "message":"둘러볼 와인샵 인덱스를 입력해주세요."},

    SEARCH_KEYWORD_EMPTY:{"isSuccess": false, "code": 2037, "message": "검색하고자 하는 키워드를 입력하새요."},

    NOT_LOGIN_USER_ID:{"isSuccess": false, "code": 2038, "message": "로그인 유저의 인덱스가 아닙니다."},

    ENTER_REIVEW_ID_TO_UPDATE:{"isSuccess": false, "code": 2039, "message": "수정할 리뷰 인덱스를 입력해주세요."},

    ENTER_IMG_URL_TO_UPDATE:{"isSuccess": false, "code": 2040, "message": "변경할 이미지 url을 입력해주세요."},
    ENTER_NICKNAME_TO_UPDATE:{"isSuccess": false, "code": 2041, "message": "변경할 닉네임을 입력해주세요."},
    ENTER_PWD_TO_USER_CHECK:{"isSuccess": false, "code": 2042, "message": "비밀번호 변경을 위해 기존 비밀번호를 입력해주세요."},

    CHOOSE_FILTERING_ITEM:{"isSuccess": false, "code": 2043, "message": "필터링할 항목을 선택해주세요."},
    ENTER_PAGE_NUMBER_TO_GET:{"isSuccess": false, "code": 2044, "message": "조회할 페이지를 선택해주세요."},
    PAGE_NUMBER_BEGIN_WITH_1:{"isSuccess": false, "code": 2045, "message": "페이지 인덱스는 1부터 시작합니다."},

    ENTER_PASSWORD_TO_WITHDRAW:{"isSuccess": false, "code": 2046, "message": "회원 탈퇴를 위해 비밀번호를 입력해주세요."},
    ENTER_REASON_FOR_WITHDRAW:{"isSuccess": false, "code": 2047, "message": "탈퇴 이유를 선택해주세요."},

    ENTER_REVIEW_ID_TO_DELETE:{"isSuccess": false, "code": 2048, "message": "삭제할 리뷰 인덱스를 입력해주세요."},

    // Response error
    ALREADY_SIGN_UP:{"isSuccess": false, "code": 3001, "message":"이미 가입되어 있는 전화번호입니다."},
    NICKNAME_ALREADY_EXIST:{"isSuccess": false, "code": 3002, "message":"이미 사용중인 닉네임입니다."},
    FAIL_TO_SEND_VERIFICATION_MSG:{"isSuccess": false, "code": 3003, "message": "인증 번호 전송에 실패했습니다."},
    VERIFY_FAIL:{"isSuccess": false, "code": 3004, "message": "휴대폰 번호 인증에 실패했습니다. 다시 시도해주세요."},
    REQUEST_VERIFY_NUM_FIRST:{"isSuccess": false, "code": 3005, "message": "해당 번호로 발급받은 인증번호가 없습니다."},
    USER_NOT_EXIST:{"isSuccess": false, "code": 3006, "message": "해당하는 회원이 존재하지 않습니다."},
    WITHDRAWAL_ACCOUNT:{"isSuccess": false, "code": 3007, "message": "탈퇴한 회원입니다."},
    SIGN_IN_PASSWORD_WRONG:{"isSuccess": false, "code": 3008, "message": "비밀번호가 일치하지 않습니다."},
    WITHDRAWAL_ACCOUNT_PHONE_NUMBER:{"isSuccess": false, "code": 3009, "message": "탈퇴한 회원의 번호입니다. 전화번호 주인이 바뀐 경우 Q&A에 문의해주세요."},


    ENTER_WINE_ID:{"isSuccess": false, "code": 3030, "message": "리뷰를 작성할 와인 인덱스를 입력해주세요."},
    RATING_NULL:{"isSuccess": false, "code": 3031, "message":"별점을 입력해주세요."},
    REVIEW_CONTENT_NULL:{"isSuccess": false, "code": 3032, "message":"리뷰 내용을 입력해주세요."},
    REVIEW_CONTENT_LENGTH_WRONG:{"isSuccess": false, "code": 3033, "message":"리뷰는 최소 20자 이상 작성해주세요."},

    WINE_NOT_EXIST:{"isSuccess": false, "code": 3040, "message":"존재하지 않는 와인 인덱스입니다."},
    WINE_NOT_EXIST_FOR_THIS_THEME:{"isSuccess": false, "code": 3041, "message":"해당 테마의 와인이 존재하지 않습니다."},
    WINE_NOT_EXIST_FOR_THIS_KEYWORD:{"isSuccess": false, "code": 3042, "message":"해당 키워드의 검색결과가 존재하지 않습니다."},
    WINE_NOT_EXIST_INCLUDE_THIS_KEYWORD:{"isSuccess": false, "code": 3043, "message":"해당 키워드를 포함하는 와인이 존재하지 않습니다."},

    WRONG_THEME:{"isSuccess": false, "code": 3044, "message":"테마명을 정확히 입력해주세요."},

    WINE_SHOP_NOT_EXIST:{"isSuccess": false, "code": 3045, "message":"검색 조건에 맞는 와인샵이 존재하지 않습니다."},
    WINE_SHOP_NOT_EXIST_INCLUDING_THIS_WINE:{"isSuccess": false, "code": 3046, "message":"해당 와인을 보유한 상점이 없습니다."},
    WINE_SEARCH_BY_NAME_NOT_EXIST:{"isSuccess": false, "code": 3047, "message":"해당 와인이 존재하지 않습니다. 와인 이름을 정확히 입력해 주세요."},

    NOT_EXIST_SHOP:{"isSuccess": false, "code": 3048, "message":"등록되지 않았거나 삭제된 와인샵입니다."},

    NOT_LOGIN_USER_SEARCH:{"isSuccess": false, "code": 3049, "message": "로그인 유저가 검색한 키워드 인덱스가 아닙니다."},
    ALREADY_DELETED_SEARCH_KEYWORD:{"isSuccess": false, "code": 3050, "message": "이미 삭제된 키워드입니다."},

    REVIEW_NOT_EXIST:{"isSuccess": false, "code": 3051, "message": "해당 인덱스의 리뷰가 존재하지 않거나 로그인 유저의 리뷰가 아닙니다."},
    DELETED_REVIEW:{"isSuccess": false, "code": 3052, "message": "삭제된 리뷰 인덱스 입니다."},

    SHOP_WINE_NOT_EXIST:{"isSuccess": false, "code": 3053, "message": "데이터 베이스의 와인 중 해당 와인샵에서 취급하는 와인이 존재하지 않습니다."},
    WRONG_PASSWORD:{"isSuccess": false, "code": 3054, "message": "기존 비밀번호가 일치하지 않습니다."},

    ALREADY_WITHDRAWN_USER:{"isSuccess": false, "code": 3055, "message": "이미 탈퇴한 회원입니다."},

    ALREADY_DELETED_REVIEW:{"isSuccess": false, "code": 3056, "message": "이미 삭제된 리뷰 인덱스 입니다."},

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
}
