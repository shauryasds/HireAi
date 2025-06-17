const mongoose =require("mongoose") 
const DbConnection = async () => {
  try {
    const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.pw5idco.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports= DbConnection;
