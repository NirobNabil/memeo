import { 
USER_STATE_CHANGE, 
CLEAR_DATA,
} from "../constants/index";

const initialState = {
    currentUser: [],
};

export const data = (state = initialState, action) => {
    switch (action.type) {
        case USER_STATE_CHANGE:
            return {
                ...state,
                currentUser: action.currentUser,
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