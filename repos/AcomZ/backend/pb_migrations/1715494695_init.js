migrate((db) => {
  const dao = new Dao(db);

  // 1. Update Users Collection (Built-in)
  const usersCollection = dao.findCollectionByNameOrId("users");
  
  usersCollection.schema.addField(new SchemaField({
    name: "karma",
    type: "number",
    required: false,
    options: { min: null, max: null }
  }));
  
  usersCollection.schema.addField(new SchemaField({
    name: "banVotes",
    type: "number",
    required: false,
  }));
  
  usersCollection.schema.addField(new SchemaField({
    name: "postCount",
    type: "number",
    required: false,
  }));
  
  dao.saveCollection(usersCollection);

  // 2. Create Posts Collection
  const postsCollection = new Collection({
    name: "posts",
    type: "base",
    listRule: "", // Anyone can read
    viewRule: "", // Anyone can view
    createRule: "@request.auth.id != ''", // Must be logged in
    updateRule: "@request.auth.id = user", // Only creator can update
    deleteRule: "@request.auth.id = user || @request.auth.postCount >= 50", // Creator or Mod can delete
    schema: [
      { name: "text", type: "text", required: false },
      { name: "color", type: "text", required: true },
      { name: "votes", type: "number", required: false },
      { name: "imageUrl", type: "file", required: false, options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } },
      { name: "voiceUrl", type: "file", required: false, options: { maxSelect: 1, maxSize: 10485760, mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "video/mp4"] } },
      { name: "banVotes", type: "number", required: false },
      { name: "user", type: "relation", required: true, options: { maxSelect: 1, collectionId: usersCollection.id, cascadeDelete: true } }
    ]
  });
  dao.saveCollection(postsCollection);

  // 3. Create Comments Collection
  const commentsCollection = new Collection({
    name: "comments",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = user",
    deleteRule: "@request.auth.id = user || @request.auth.postCount >= 50",
    schema: [
      { name: "text", type: "text", required: true },
      { name: "banVotes", type: "number", required: false },
      { name: "post", type: "relation", required: true, options: { maxSelect: 1, collectionId: postsCollection.id, cascadeDelete: true } },
      { name: "user", type: "relation", required: true, options: { maxSelect: 1, collectionId: usersCollection.id, cascadeDelete: true } }
    ]
  });
  dao.saveCollection(commentsCollection);

  // 4. Create Banned Keywords Collection
  const bannedKeywordsCollection = new Collection({
    name: "banned_keywords",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.postCount >= 50", // Mod only
    updateRule: "@request.auth.postCount >= 50", // Mod only
    deleteRule: null, // Admin only
    schema: [
      { name: "word", type: "text", required: true },
      { name: "votes", type: "number", required: false },
      { name: "active", type: "bool", required: false }
    ]
  });
  dao.saveCollection(bannedKeywordsCollection);

}, (db) => {
  const dao = new Dao(db);
  try { dao.deleteCollection(dao.findCollectionByNameOrId("banned_keywords")); } catch (e) {}
  try { dao.deleteCollection(dao.findCollectionByNameOrId("comments")); } catch (e) {}
  try { dao.deleteCollection(dao.findCollectionByNameOrId("posts")); } catch (e) {}
});
