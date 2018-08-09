import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Typography } from 'material-ui';
import { PlaylistAdd, Sort, ExpandMore } from 'material-ui-icons';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Card from '../../containers/Retro/Card';
import { QUERY_ERROR_KEY, queryFailed, QueryShape } from '../../services/websocket/query';
import { good } from '../../theme/colors';

class Column extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      curCards: [],
      abc: true,
      hide: false
    };
  }

  componentWillMount() {
    this.setCards();
  }
  componentWillReceiveProps(nextProps) {
    this.setCards();

    const { addCardQuery, addMessage } = this.props;
    const { addCardQuery: nextAddCardQuery } = nextProps;
    if (queryFailed(addCardQuery, nextAddCardQuery)) {
      addMessage(nextAddCardQuery[QUERY_ERROR_KEY]);
    }
  }
  setCards = () => {
    const { cards } = this.props;
    const { column } = this.props;
    this.setState({
      curCards: cards.filter(card => column.id === card.columnId)
    });
  }

  addCard = () => {
    const { socket } = this.context;
    const { text } = this.state;
    const { column, cards, addCard } = this.props;

    addCard(socket, column.id, text);
    this.setState({
      text: '',
      hide: false,
      curCards: cards.filter(card => column.id === card.columnId)
    });
  };

  sortCards = () => {
    const { cards } = this.props;
    const { column } = this.props;
    const curCards = Array.from(cards.filter(card => column.id === card.columnId));
    const sortPattern = this.state.abc
      ? (cardA, cardB) => cardA.votes.length < cardB.votes.length
      : (cardA, cardB) => cardA.votes.length > cardB.votes.length;
    const sortedCards = curCards.sort(sortPattern);
    this.setState({
      curCards: sortedCards,
      abc: !this.state.abc
    });
  };

  hideCards = () => {
    if (!this.state.hide) {
      this.setState({
        curCards: [],
        hide: true
      });
    } else {
      const { cards } = this.props;
      const { column } = this.props;
      this.setState({
        curCards: cards.filter(card => column.id === card.columnId),
        hide: false,
        abc: true
      });
    }
  }


  handleTextChange = (e) => {
    this.setState({ text: e.target.value });
  };

  render() {
    const {
      column,
      classes,
      hoveredColumn,
      columnCardCombine,
      cardEnterEvent,
      cardLeaveEvent
    } = this.props;
    return (
      <div
        className={
          columnCardCombine === column.id
            ? `${classes.column} p-Column-Card-Combine`
            : classes.column
        }
        style={{ borderColor: (hoveredColumn && column.id === hoveredColumn)
          ? good
          : '#ccc'
        }}
      >
        <div className={classes.header}>
          <Typography
            type="headline"
            className={classes.columnTitle}
            onDoubleClick={this.startEditing}
          >{column.name}
          </Typography>
          <div>
            <IconButton className={classes.addCardIcon} onClick={this.hideCards}>
              <ExpandMore className={classes.actionIcon} />
            </IconButton>
            <IconButton className={classes.addCardIcon} onClick={this.addCard}>
              <PlaylistAdd className={classes.actionIcon} />
            </IconButton>
            <IconButton className={classes.addCardIcon} onClick={this.sortCards}>
              <Sort className={classes.actionIcon} />
            </IconButton>
          </div>
        </div>

        <Droppable droppableId={column.id} >
          {topProvided => (
            <div
              ref={topProvided.innerRef}
              {...topProvided.droppableProps}
              style={{ height: '100%' }}
            >

              {this.state.curCards.map((card, index) => (
                <Draggable
                  draggableId={card.id}
                  index={index}
                  key={card.id}
                >
                  {(provided, snapshot) => (
                    <div
                      className="p-DraggableItem"
                    >
                      <div
                        className={snapshot.isDragging ? 'p-DraggingItem' : ''}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onMouseEnter={() => cardEnterEvent(card.id)}
                        onMouseLeave={() => cardLeaveEvent}
                      >

                        <Card
                          card={card}
                          key={card.id}
                        />

                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Draggable>

              ))}

            </div>
          )}
        </Droppable>

      </div>
    );
  }
}

Column.contextTypes = {
  socket: PropTypes.object.isRequired
};

Column.propTypes = {
  // Values
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  cards: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    columnId: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired,
  groups: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.string.isRequired)
  })).isRequired,
  hoveredColumn: PropTypes.string,
  columnCardCombine: PropTypes.string,
  // Functions
  addCard: PropTypes.func.isRequired,
  addMessage: PropTypes.func.isRequired,
  cardEnterEvent: PropTypes.func.isRequired,
  cardLeaveEvent: PropTypes.func.isRequired,
  // Queries
  addCardQuery: PropTypes.shape(QueryShape).isRequired,
  // Styles
  classes: PropTypes.shape({
    column: PropTypes.string.isRequired,
    columnTitle: PropTypes.string.isRequired,
    addCardIcon: PropTypes.string.isRequired,
    addCardContainer: PropTypes.string.isRequired
  }).isRequired
};

Column.defaultProps = {
  hoveredColumn: '',
  columnCardCombine: ''
};
export default Column;
