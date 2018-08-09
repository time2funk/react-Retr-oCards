import mongoose from 'mongoose';
import Retro from '../../models/retro.model';
import User from '../../models/user.model';
import { ACTION_CARD_ADD, ACTION_CARD_EDIT, ACTION_CARD_REMOVE, ACTION_CARD_MOVE, ACTION_CARDS_GROUP } from './card.actions';
import { getId, getIds } from '../../utils';

export default {
  [ACTION_CARD_ADD]: async (params, state) => {
    const { retroId, userId } = state;
    const { text, columnId } = params;
    const retro = await Retro.findById(retroId);
    if (!retro || !retro.participates(userId)) {
      throw new Error('You are not participating in a retrospective.');
    }
    const column = retro.columns.find(c => getId(c) === columnId);
    if (!column) throw new Error('Column incorrect or not selected.');
    const user = await User.findById(userId);
    const card = {
      _id: new mongoose.Types.ObjectId(),
      columnId,
      text,
      new: true,
      authors: [userId],
      votes: []
    };

    const updated = await Retro.findOneAndUpdate(
      { _id: retroId },
      {
        $push: {
          cards: {
            $each: [card], $position: 0
          }
        }
      },
      { new: true }
    ).exec();
    if (!updated) {
      throw new Error('Couldn\'t add a card.');
    }

    return {
      broadcast: {
        ...card,
        ...{ authors: [user] },
        _id: undefined,
        id: getId(card._id)
      }
    };
  },
  [ACTION_CARD_EDIT]: async (params, state) => {
    const { retroId, userId } = state;
    const { text, id, addVote, removeVote } = params;
    const retro = await Retro.findById(retroId).populate('cards.authors');
    if (!retro.participates(userId)) {
      throw new Error('You are not participating in a retrospective.');
    }
    const cardIndex = retro.cards.findIndex(c => c.id === id);
    const card = retro.cards[cardIndex];

    if (addVote) card.votes.push(addVote);
    if (removeVote) {
      const key = card.votes.findIndex(v => v.toHexString() === removeVote);
      card.votes.splice(key, 1);
    }
    if (text) card.text = text;

    const updatedRetro = await retro.save();

    if (!updatedRetro) {
      throw new Error('Card not updated because it doesn\'t exist or you don\'t have sufficient privileges.');
    }
    return {
      broadcast: {
        id,
        text: card.text,
        authors: card.authors,
        votes: getIds(card.votes)
      }
    };
  },
  [ACTION_CARD_REMOVE]: async (params, state) => {
    const { retroId, userId } = state;
    const { id } = params;
    const retro = await Retro.findById(retroId);
    if (!retro.participates(userId)) {
      throw new Error('You are not participating in a retrospective.');
    }

    const updated = await Retro.findOneAndUpdate({
      _id: retroId,
      cards: { $elemMatch: { _id: id, authors: userId } }
    }, {
      $pull: { cards: { _id: id } }
    }, {
      new: true
    }).exec();

    if (!updated) {
      throw new Error('Card not removed because it doesn\'t exist or you don\'t have sufficient privileges.');
    }

    return {
      broadcast: {
        id
      }
    };
  },
  [ACTION_CARD_MOVE]: async (params, state) => {
    const { retroId, userId } = state;
    const { columnId, cardId } = params;
    const retro = await Retro.findById(retroId);
    if (!retro.participates(userId)) {
      throw new Error('You are not participating in a retrospective.');
    }

    const column = retro.columns.find(c => getId(c) === columnId);
    if (!column) throw new Error('Column incorrect or not selected.');

    const updated = await Retro.findOneAndUpdate({
      _id: retroId,
      cards: { $elemMatch: { _id: cardId, authors: userId } }
    }, {
      $set: { 
        'cards.$.columnId' : columnId
      }
    }).exec();

    if (!updated) {
      throw new Error('Card not moved because it doesn\'t exist or you don\'t have sufficient privileges.');
    }

    return {
      broadcast: {
        columnId,
        cardId
      }
    };
  },
  [ACTION_CARDS_GROUP]: async (params, state) => {
    const { retroId, userId } = state;
    const { source, target } = params;

    const newGroup = async () => {
      let group = {
        _id: new mongoose.Types.ObjectId(),
        cards: [],
        new: true
      }
      let newGoup = await Retro.findOneAndUpdate({
        _id: retroId
      }, {
        $push: {
          groups: { 
            $each: [group],
            $position: 0
          }
        }
      },
      { new: true }).exec();
      console.log('newGoup', newGoup);
      return group;
    }

    const removeGroup = async (A) => {
      const removeResult = await Retro.findOneAndUpdate({
        _id: retroId,
        groups: { $elemMatch: { _id: A.id } }
      }, {
        $pull: {
          groups: {
            _id: A.id
          }
        }
      },
      { new: true }).exec();
      console.log('removeResult', removeResult);
      return removeResult;
    }
    const addCardToGroup = async (Card, Group) => {
      const retro = await Retro.findById(retroId);
      if (!retro.participates(userId)) {
        throw new Error('You are not participating in a retrospective.');
      }
      const groupIndex = retro.groups.findIndex(g => g['_id'].toString === Group.toString);
      const group = retro.groups[groupIndex];
      group.cards.push(mongoose.Types.ObjectId(Card));
      const updatedRetro = await retro.save();
      if (!updatedRetro) {
        throw new Error('Card not updated because it doesn\'t exist or you don\'t have sufficient privileges.');
      }
    }

    if (target.type === 'card') {
      if (source.type === 'card') {
        let group = await newGroup();
        await addCardToGroup(target.id, group._id);
        await addCardToGroup(source.id, group._id);
      } else if (source.type === 'group') {
        await addCardToGroup(target.id, source.id);
      }
    } else if (target.type === 'group'){
      if (source.type === 'card') {
        await addCardToGroup(source.id, target.id);

      } else if (source.type === 'group') {
        for (let i = 0; i < source.array.length; i++){
          await addCardToGroup(source.array[i], target.id);
        }
        await removeGroup(source.id);
      }
    }

    // if (!updated) {
    //   throw new Error('Card not moved because it doesn\'t exist or you don\'t have sufficient privileges.');
    // }

    return {
      broadcast: {
        source,
        target
      }
    };
  }
};
