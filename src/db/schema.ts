import {
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom().unique(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    bannerUrl: text("banner_url"),
    bannerKey: text("banner_key"),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)],
);

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videoViews: many(videoViews),
  videoReactions: many(videoReactions),
  subscriptions: many(subscriptions, {
    relationName: "creator_subscriptions_fk",
  }),
  subscribers: many(subscriptions, {
    relationName: "viewer_subscriptions_fk",
  }),
  comments: many(comments),
  commentReactions: many(commentReactions),
  playlistVideos: many(playlistVideos),
}));

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom().unique(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("name_idx").on(t.name)],
);

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export const playlistVideos = pgTable(
  "playlist_videos",
  {
    playlistId: uuid("playlist_id")
      .references(() => playlists.id, {
        onDelete: "cascade",
      })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "playlist_videos_pk",
      columns: [t.playlistId, t.videoId],
    }),
  ],
);

export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));

export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const playlistRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  video: many(playlistVideos),
}));

export const videoVisibility = pgEnum("video_visibility", [
  "private",
  "public",
]);

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  title: text("title").notNull(),
  description: text("description"),
  muxStatus: text("mux_status"),
  muxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),
  duration: integer("duration"),
  videoVisibility: videoVisibility("video_visibility")
    .default("private")
    .notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const videoSelectSchema = createSelectSchema(videos);
export const videoInsertSchema = createInsertSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);

export const videoRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  views: many(videoViews),
  reactions: many(videoReactions),
  comments: many(comments),
}));

export const videoViews = pgTable(
  "video_views",
  {
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "video_views_pkey",
      columns: [t.userId, t.videoId],
    }),
  ],
);

export const videoViewRelations = relations(videoViews, ({ one }) => ({
  users: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);

export const reactionType = pgEnum("reaction_type", ["like", "dislike"]);

export const videoReactions = pgTable(
  "video_reactions",
  {
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),
    type: reactionType("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "video_reactions_pk",
      columns: [t.userId, t.videoId],
    }),
  ],
);

export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
  users: one(users, {
    fields: [videoReactions.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
}));

export const videoReactionsSelectSchema = createSelectSchema(videoReactions);
export const videoReactionsInsertSchema = createInsertSchema(videoReactions);
export const videoReactionsUpdateSchema = createUpdateSchema(videoReactions);

export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: uuid("viewer_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    creatorId: uuid("creator_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "subscriptions_pk",
      columns: [t.viewerId, t.creatorId],
    }),
  ],
);

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
    relationName: "viewer_subscriptions_fk",
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName: "creator_subscriptions_fk",
  }),
}));

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom().unique(),
    parentId: uuid("parent_id"),
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      foreignKey({
        columns: [t.parentId],
        foreignColumns: [t.id],
        name: "comments_parent_id_fk",
      }).onDelete("cascade"),
    ];
  },
);

export const commentRelations = relations(comments, ({ one, many }) => ({
  users: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comments_parent_id_fk",
  }),
  reaction: many(commentReactions),
  replies: many(comments, {
    relationName: "comments_parent_id_fk",
  }),
}));

export const commentReactionsType = pgEnum("comments_reaction_type", [
  "like",
  "dislike",
]);

export const commentReactions = pgTable(
  "comment_reactions",
  {
    commentId: uuid("comment_id")
      .references(() => comments.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    type: commentReactionsType("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "comments_reaction_pk",
      columns: [t.commentId, t.userId],
    }),
  ],
);

export const commentsReactionRelations = relations(
  commentReactions,
  ({ one }) => ({
    comments: one(comments, {
      fields: [commentReactions.commentId],
      references: [comments.id],
    }),
    users: one(users, {
      fields: [commentReactions.userId],
      references: [users.id],
    }),
  }),
);
