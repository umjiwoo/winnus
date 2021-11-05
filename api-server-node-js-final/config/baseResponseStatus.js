module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },
    SEND_VERIFICATION_MSG_SUCCESS:{"isSuccess": true, "code": 1002, "message":"인증번호 전송 성공" },
    VERIFY_SUCCESS:{"isSuccess": true, "code": 1003, "message":"휴대폰 번호 인증 성공"},

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

    WINE_ID_NULL:{ "isSuccess": false, "code": 2030, "message":"검색한 와인 인덱스를 입력해주세요."},


    // Response error
    ALREADY_SIGN_UP:{"isSuccess": false, "code": 3001, "message":"이미 가입되어 있는 전화번호입니다."},
    NICKNAME_ALREADY_EXIST:{"isSuccess": false, "code": 3002, "message":"이미 사용중인 닉네임입니다."},
    FAIL_TO_SEND_VERIFICATION_MSG:{"isSuccess": false, "code": 3003, "message": "인증 번호 전송에 실패했습니다."},
    VERIFY_FAIL:{"isSuccess": false, "code": 3004, "message": "휴대폰 번호 인증에 실패했습니다. 다시 시도해주세요."},
    REQUEST_VERIFY_NUM_FIRST:{"isSuccess": false, "code": 3005, "message": "발급받은 인증번호가 없습니다."},
    USER_NOT_EXIST:{"isSuccess": false, "code": 3006, "message": "해당 번호로 가입된 회원이 존재하지 않습니다."},
    WITHDRAWAL_ACCOUNT:{"isSuccess": false, "code": 3007, "message": "탈퇴한 회원입니다."},
    SIGN_IN_PASSWORD_WRONG:{"isSuccess": false, "code": 3008, "message": "비밀번호가 일치하지 않습니다."},

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
}
