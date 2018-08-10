export const ACTION_CARD_ADD = 'card/add';
export const CARD_ADD_IN_PROGRESS = 'CARD_ADD_IN_PROGRESS';
export const CARD_ADD_SUCCESS = 'CARD_ADD_SUCCESS';
export const CARD_ADD_FAILURE = 'CARD_ADD_FAILURE';

export const ACTION_CARD_EDIT = 'card/edit';
export const CARD_EDIT_IN_PROGRESS = 'CARD_EDIT_IN_PROGRESS';
export const CARD_EDIT_SUCCESS = 'CARD_EDIT_SUCCESS';
export const CARD_EDIT_FAILURE = 'CARD_EDIT_FAILURE';

export const ACTION_CARD_REMOVE = 'card/remove';
export const CARD_REMOVE_IN_PROGRESS = 'CARD_REMOVE_IN_PROGRESS';
export const CARD_REMOVE_SUCCESS = 'CARD_REMOVE_SUCCESS';
export const CARD_REMOVE_FAILURE = 'CARD_REMOVE_FAILURE';

export const ACTION_CARD_MOVE = 'card/move';
export const CARD_MOVE_IN_PROGRESS = 'CARD_MOVE_IN_PROGRESS';
export const CARD_MOVE_SUCCESS = 'CARD_MOVE_SUCCESS';
export const CARD_MOVE_FAILURE = 'CARD_MOVE_FAILURE';

export const ACTION_CARDS_GROUP = 'cards/group';
export const CARDS_GROUP_IN_PROGRESS = 'CARDS_GROUP_IN_PROGRESS';
export const CARDS_GROUP_SUCCESS = 'CARDS_GROUP_SUCCESS';
export const CARDS_GROUP_FAILURE = 'CARDS_GROUP_FAILURE';

export const cardAdd = (socket, columnId, text) => (dispatch) => {
  socket.emit(ACTION_CARD_ADD, { columnId, text });
  dispatch({ type: CARD_ADD_IN_PROGRESS });
};

export const cardRemove = (socket, cardId) => (dispatch) => {
  socket.emit(ACTION_CARD_REMOVE, { id: cardId });
  dispatch({ type: CARD_REMOVE_IN_PROGRESS });
};

export const cardEdit = (socket, card) => (dispatch) => {
  socket.emit(ACTION_CARD_EDIT, card);
  dispatch({ type: CARD_EDIT_IN_PROGRESS });
};

export const cardMove = (socket, columnId, cardId) => (dispatch) => {
  socket.emit(ACTION_CARD_MOVE, { columnId, cardId });
  dispatch({ type: CARD_MOVE_IN_PROGRESS });
};

export const cardsGroup = (socket, source, target) => (dispatch) => {
  socket.emit(ACTION_CARDS_GROUP, { source, target });
  dispatch({ type: CARDS_GROUP_IN_PROGRESS });
};
