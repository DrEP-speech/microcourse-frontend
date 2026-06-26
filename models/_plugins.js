// models/_plugins.js
import mongoose from 'mongoose';

export const withBaseFields = (schema, { hide = [] } = {}) => {
  // common fields
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  });

  // timestamps
  schema.set('timestamps', true); // createdAt, updatedAt
  schema.set('versionKey', false); // drop __v

  // unify JSON (id instead of _id, strip internals)
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      // strip sensitive/custom
      hide.forEach((k) => delete ret[k]);
      return ret;
    },
  });

  // convenience query helper for not-deleted
  schema.query.notDeleted = function () {
    return this.where({ isDeleted: { $ne: true } });
  };
};
