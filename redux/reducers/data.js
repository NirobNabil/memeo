import { 
USER_STATE_CHANGE, 
CLEAR_DATA,
USER_CHATS_STATE_CHANGE,
} from "../constants/index";

const initialState = {
    currentUser: [],
    chats: [],
};

export const data = (state = initialState, action) => {
    switch (action.type) {
        case USER_STATE_CHANGE:
            return {
                ...state,
                currentUser: action.currentUser,
            };
        case USER_CHATS_STATE_CHANGE:
            return {
                ...state,
                chats: action.chats,
            };
        case CLEAR_DATA:
            return {
                ...state,
                currentUser: []
            };
        default:
            return state;
    }
}