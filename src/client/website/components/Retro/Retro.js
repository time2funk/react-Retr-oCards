import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';

import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField
} from 'material-ui';
import { CircularProgress } from 'material-ui/Progress';
import {
  QUERY_ERROR_KEY,
  QUERY_STATUS_FAILURE,
  QUERY_STATUS_KEY,
  QUERY_STATUS_SUCCESS,
  queryFailed,
  QueryShape,
  querySucceeded
} from '../../services/websocket/query';
import Column from '../../containers/Retro/Column';
import CardComponent from '../../containers/Retro/Card';
import Steps from '../../containers/Retro/Steps';
import { initialsOf } from '../../services/utils/initials';


class Retro extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredColumn: '',
      columnCardCombine: '',
      hoveredCardId: '',
      dialogOpenStatus: false,
      dialogTitle: '',
      dialogText: '',
      searchValue: ''
    };
    this.cardEnterEventHandler = this.cardEnterEventHandler.bind(this);
    this.cardLeaveEventHandler = this.cardLeaveEventHandler.bind(this);
    this.onChangeSearchInput = this.onChangeSearchInput.bind(this);
  }
  componentWillMount() {
    this.joinRetro();
  }

  componentWillReceiveProps(nextProps) {
    const {
      addColumnQuery,
      connectQuery,
      addMessage,
      moveCardQuery,
      groupCardsQuery
    } = this.props;
    const {
      addColumnQuery: nextAddColumnQuery,
      connectQuery: nextConnectQuery,
      moveCardQuery: nextMoveCardQuery,
      groupCardsQuery: nextGroupCardsQuery
    } = nextProps;
    if (queryFailed(addColumnQuery, nextAddColumnQuery)) {
      addMessage(nextAddColumnQuery[QUERY_ERROR_KEY]);
    }
    if (queryFailed(moveCardQuery, nextMoveCardQuery)) {
      addMessage(nextMoveCardQuery[QUERY_ERROR_KEY]);
    }
    if (queryFailed(groupCardsQuery, nextGroupCardsQuery)) {
      addMessage(nextGroupCardsQuery[QUERY_ERROR_KEY]);
    }
    if (querySucceeded(connectQuery, nextConnectQuery)) {
      this.joinRetro();
    }
  }

  // Drag Card Action Part
  onDragStart = (start) => {
    const { source } = start;

    this.setState({
      hoveredColumn: '',
      columnCardCombine: source.droppableId
    });
  };
  onDragUpdate = (update) => {
    const { destination, source } = update;

    if (!destination) {
      this.setState({
        hoveredColumn: '',
        columnCardCombine: ''
      });
    } else if (source.droppableId !== destination.droppableId) {
      this.setState({
        hoveredColumn: destination.droppableId,
        columnCardCombine: ''
      });
    } else if (source.droppableId === destination.droppableId) {
      this.setState({
        hoveredColumn: '',
        columnCardCombine: source.droppableId
      });
    }
  }
  onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    this.setState({
      columnCardCombine: '',
      hoveredColumn: ''
    });
    // dropped outside the list
    if (!destination) {
      return;
    }
    if (source.droppableId !== destination.droppableId) {
      const title = 'Do you want to move this Card to other Column?';
      const text = 'The Card will be edited and asigned to the other Column.';
      this.dialogOpenHandler(title, text, () => {
        const { socket } = this.context;
        const { moveCard } = this.props;
        const columnId = destination.droppableId;
        const cardId = draggableId;
        const cards = Array.from(this.props.cards);
        // just to hide the blink before action query done
        const cardIndex = cards.findIndex(card => card.id === cardId);
        cards[cardIndex].columnId = columnId;
        this.setProps = {
          ...cards
        };
        // do the action query
        moveCard(socket, columnId, cardId);
      });
    } else {
      const { hoveredCardId } = this.state;
      // The Card was dragged in to other Card in one Column
      console.log('------------------------');
      console.log({ draggableId, hoveredCardId });
      if (draggableId !== hoveredCardId) {
        const title = 'Do you want to group this Cards?';
        const text = 'The Cards will be grouped and the Votes will be summarized.';
        this.dialogOpenHandler(title, text, () => {
          const { socket } = this.context;
          const { groupCards } = this.props;
          groupCards(socket, {
            id: draggableId,
            type: 'card'
          }, {
            id: hoveredCardId,
            type: 'card'
          });
        });
      }
    }
  };

  // Search Event
  onChangeSearchInput = (event) => {
    this.setState({
      searchValue: event.target.value
    });
  }

  // Hover Cards Action
  cardEnterEventHandler = (cardId) => {
    this.setState({
      hoveredCardId: cardId
    });
  }
  cardLeaveEventHandler = () => {
    this.setState({
      hoveredCardId: ''
    });
  }

  // Dialog Handler
  dialogOpenHandler = (title, text, callback) => {
    if (title && text) {
      this.setState({
        dialogOpenStatus: true,
        dialogTitle: title,
        dialogText: text
      });
      if (callback) this.dCallback = callback;
    } else {
      this.setState({ dialogOpenStatus: true });
    }
  };
  dialogClose = () => {
    this.setState({
      dialogOpenStatus: false,
      dialogTitle: '',
      dialogText: ''
    });
  };
  dialogAgreeAction = () => {
    this.setState({
      dialogOpenStatus: false,
      dialogTitle: '',
      dialogText: ''
    });
    if (this.dCallback) this.dCallback();
  }

  joinRetro = () => {
    const { joinRetro, match: { params: { retroShareId } } } = this.props;
    const { socket } = this.context;
    joinRetro(socket, retroShareId);
  };

  render() {
    const {
      classes,
      columns,
      users,
      history,
      joinRetroQuery: {
        [QUERY_STATUS_KEY]: joinStatus,
        [QUERY_ERROR_KEY]: joinError
      }
    } = this.props;

    switch (joinStatus) {
      case QUERY_STATUS_SUCCESS:
        return (
          <DragDropContext
            onDragStart={this.onDragStart}
            onDragUpdate={this.onDragUpdate}
            onDragEnd={this.onDragEnd}
          >
            <div className={classes.root}>
              <Steps />
              <div className="search-container">
                <div>
                  <TextField
                    defaultValue={this.state.searchValue}
                    onChange={this.onChangeSearchInput}
                    id="search"
                    label="Search field"
                    type="search"
                    className="search-textField"
                    margin="normal"
                  />
                </div>
              </div>

              {(this.state.searchValue.length !== 0) &&
                <div className={classes.root}>
                  <Card className={classes.messageCard}>
                    {this.props.cards.filter((c) => {
                      const regex = new RegExp(this.state.searchValue, 'i');
                      return c.text.match(regex);
                    }).map(card => (
                      <CardComponent
                        card={card}
                        key={card.id}
                      />
                    ))}
                  </Card>
                </div>
              }
              {(this.state.searchValue.length === 0) &&
                <div>
                  <div className={classes.columns}>
                    {columns.map(column => (
                      <Column
                        key={column.id}
                        column={column}
                        hoveredColumn={this.state.hoveredColumn}
                        columnCardCombine={this.state.columnCardCombine}
                        cardEnterEvent={this.cardEnterEventHandler}
                        cardLeaveEvent={this.cardLeaveEventHandler}
                      />
                    ))}
                  </div>
                  <div className={classes.users}>
                    {Object.values(users).map(({ id, name }) => (
                      <Tooltip key={id} title={name} placement="left">
                        <Avatar
                          alt={name}
                          className={classes.avatar}
                        >
                          {initialsOf(name)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </div>

                  <Dialog
                    open={this.state.dialogOpenStatus}
                    keepMounted
                    onClose={this.dialogClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                  >
                    <DialogTitle id="alert-dialog-slide-title">
                      {this.state.dialogTitle}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-slide-description">
                        {this.state.dialogText}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.dialogClose} color="primary">
                        Disagree
                      </Button>
                      <Button onClick={this.dialogAgreeAction} color="primary">
                        Agree
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              }

            </div>
          </DragDropContext>
        );
      case QUERY_STATUS_FAILURE:
        return (
          <DragDropContext
            onDragEnd={this.onDragEnd}
          >
            <div className={classes.root}>
              <Card className={classes.messageCard}>
                <Typography type="headline">Error</Typography>
                <CardContent>
                  <Typography>{joinError}</Typography>
                </CardContent>
                <CardActions>
                  <Button onClick={() => history.goBack()}>Back</Button>
                </CardActions>
              </Card>
            </div>
          </DragDropContext>
        );
      default:
        return (
          <DragDropContext
            onDragEnd={this.onDragEnd}
          >
            <div className={classes.root}>
              <Card className={classes.messageCard}>
                <CircularProgress color="primary" />
              </Card>
            </div>
          </DragDropContext>
        );
    } // switch
  }
}

Retro.contextTypes = {
  socket: PropTypes.object.isRequired
};

Retro.propTypes = {
  // Values
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      retroShareId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    isHovered: PropTypes.bool
  })).isRequired,
  cards: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    columnId: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired,
  users: PropTypes.object.isRequired,
  // hoveredCardId: PropTypes.string,
  // Queries
  connectQuery: PropTypes.shape(QueryShape).isRequired,
  joinRetroQuery: PropTypes.shape(QueryShape).isRequired,
  addColumnQuery: PropTypes.shape(QueryShape).isRequired,
  moveCardQuery: PropTypes.shape(QueryShape).isRequired,
  groupCardsQuery: PropTypes.shape(QueryShape).isRequired,
  // Functions
  moveCard: PropTypes.func.isRequired,
  groupCards: PropTypes.func.isRequired,
  joinRetro: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired,
  // Styles
  classes: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    root: PropTypes.string.isRequired,
    messageCard: PropTypes.string.isRequired,
    columns: PropTypes.string.isRequired,
    users: PropTypes.string.isRequired,
    hidden: PropTypes.string.isRequired
  }).isRequired
};

// Retro.defaultProps = {
//   groups: []
// };
export default Retro;
