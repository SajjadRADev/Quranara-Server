import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { IBlog } from "./Blog";

export interface IBlogLike {
    blog: PopulatedDoc<Document<ObjectId> & IBlog>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
}

const schema = new Schema<IBlogLike>({
    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
        index: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
});

schema.index({ blog: 1, user: 1 }, { unique: true });

const BlogLikeModel = model<IBlogLike>("BlogLike", schema);

export default BlogLikeModel;