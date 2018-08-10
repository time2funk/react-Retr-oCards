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
    this.setCards(this.props);
  }
  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps', this.props);
    console.log('nextProps', nextProps);
    const { addCardQuery, addMessage, groupCardsQuery } = this.props;
    const { addCardQuery: nextAddCardQuery } = nextProps;
    const { groupCardsQuery: nextGroupCardsQuery } = nextProps;
    if (queryFailed(addCardQuery, nextAddCardQuery)) {
      addMessage(nextAddCardQuery[QUERY_ERROR_KEY]);
    }
    if (queryFailed(groupCardsQuery, nextGroupCardsQuery)) {
      addMessage(nextGroupCardsQuery[QUERY_ERROR_KEY]);
    }
    this.setCards(nextProps);
  }

  setCards = (props) => {
    const { cards } = props;
    const { column } = props;
    const { groups } = props;

    // create Cards-Arr from this Column
    if (groups.length !== 0) {
      let newCards = cards.filter(card => column.id === card.columnId);
      const curGroups = [];
      // lets loop through Groups props
      for (let i = 0; i < groups.length; i++) {
        const tmpArr = {
          id: groups[i].id,
          cards: [],
          votes: [],
          type: 'group'
        };
        for (let j = 0; j < groups[i].cards.length; j++) {
          const index = newCards.findIndex(c => (c !== undefined && c.id === groups[i].cards[j]));

          if (index !== -1) {
            // push card in to the temp array of Group objects
            tmpArr.cards.push(newCards[index]);
            // push card Votes
            tmpArr.votes = tmpArr.votes.concat(newCards[index].votes);
            // delete the card from the Cards-Arr
            delete newCards[index];
          }
        }
        if (tmpArr.cards.length !== 0) {
          curGroups.push(tmpArr);
        }
      }
      // remove undefined items
      newCards = newCards.concat(curGroups);
      newCards = newCards.filter(e => e !== undefined);
      this.setState({
        curCards: newCards
      });
    } else {
      this.setState({
        curCards: cards.filter(card => column.id === card.columnId)
      });
    }
  }

  addCard = () => {
    const { socket } = this.context;
    const { text } = this.state;
    const { column, addCard } = this.props;

    addCard(socket, column.id, text);
    this.setState({
      text: '',
      hide: false
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
      this.setCards(this.props);
      this.setState({
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

              {this.state.curCards.map((item, index) => (
                <div key={item.id}>
                  {(item.type && item.type === 'group') ? (
                    <div>
                      <hr />
                      <div>GROUP</div>
                      <p>{item.id}</p>
                      {item.cards.map(c => (
                        <div
                          key={c.id}
                          style={{ textAlign: 'left', outline: '1px solid gray' }}
                        >
                          <p><strong> card-id </strong> {c.id} </p>
                          <p><strong> card-text </strong> {c.text} </p>
                        </div>
                      ))}
                      <hr />
                    </div>
                  ) : (
                    <Draggable
                      draggableId={item.id}
                      index={index}
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
                            onMouseEnter={() => cardEnterEvent(item.id)}
                            onMouseLeave={() => cardLeaveEvent}
                          >

                            <Card
                              card={item}
                              key={item.id}
                            />

                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Draggable>
                  )}
                </div>
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
  groupCardsQuery: PropTypes.shape(QueryShape).isRequired,
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
