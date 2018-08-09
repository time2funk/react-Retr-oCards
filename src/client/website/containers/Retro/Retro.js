import { withStyles } from 'material-ui/styles';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from './../../components/Retro/Retro.styles';
import Retro from '../../components/Retro';
import { retroJoin, setRetroIdQueryParameter } from '../../actions/retro';
import { columnAdd, columnRemove } from '../../actions/column';
import { cardMove, cardsGroup } from '../../actions/card';
import {
  CARDS_GROUP_QUERY_KEY,
  CARD_MOVE_QUERY_KEY,
  COLUMN_ADD_QUERY_KEY,
  COLUMN_REMOVE_QUERY_KEY,
  RETRO_CARDS_KEY,
  RETRO_COLUMNS_KEY,
  RETRO_GROUPS_KEY,
  RETRO_JOIN_QUERY_KEY,
  RETRO_NAME_KEY,
  RETRO_RENAME_QUERY_KEY, RETRO_SCRUM_MASTER_ID_KEY,
  RETRO_SHARE_ID_KEY,
  RETRO_STEP_KEY,
  RETRO_USERS_KEY
} from '../../reducers/retro';
import { addMessage } from '../../actions/layout';
import { USER_CONNECT_QUERY_KEY, USER_ID_KEY } from '../../reducers/user';

const mapStateToProps = ({ retro, user }) => ({
  groupCardsQuery: retro[CARDS_GROUP_QUERY_KEY],
  moveCardQuery: retro[CARD_MOVE_QUERY_KEY],
  name: retro[RETRO_NAME_KEY],
  shareId: retro[RETRO_SHARE_ID_KEY],
  columns: retro[RETRO_COLUMNS_KEY],
  groups: retro[RETRO_GROUPS_KEY],
  cards: retro[RETRO_CARDS_KEY],
  users: retro[RETRO_USERS_KEY],
  userId: user[USER_ID_KEY],
  scrumMasterId: retro[RETRO_SCRUM_MASTER_ID_KEY],
  step: retro[RETRO_STEP_KEY],
  connectQuery: user[USER_CONNECT_QUERY_KEY],
  joinRetroQuery: retro[RETRO_JOIN_QUERY_KEY],
  renameRetroQuery: retro[RETRO_RENAME_QUERY_KEY],
  addColumnQuery: retro[COLUMN_ADD_QUERY_KEY],
  removeColumnQuery: retro[COLUMN_REMOVE_QUERY_KEY]
});

const mapDispatchToProps = dispatch => ({
  groupCards: (socket, cardAId, cardBId) => dispatch(cardsGroup(socket, cardAId, cardBId)),
  moveCard: (socket, columnId, cardId) => dispatch(cardMove(socket, columnId, cardId)),
  joinRetro: (socket, shareId) => dispatch(retroJoin(socket, shareId)),
  addColumn: (socket, name, icon) => dispatch(columnAdd(socket, name, icon)),
  removeColumn: (socket, id) => dispatch(columnRemove(socket, id)),
  setRetroId: retroId => dispatch(setRetroIdQueryParameter(retroId)),
  addMessage: message => dispatch(addMessage(message))
});

export default withRouter(withStyles(styles, { withTheme: true })(
  connect(mapStateToProps, mapDispatchToProps)(Retro)
));
