//here is the working solution for lesson 321 as of May 2023!
//please upvote this thread if it worked for you too!
 
//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
 
 
 
mongoose.connect('mongodb+srv://admin-kevin:fofenob@cluster0.rdxrwo8.mongodb.net/todolistDB');
 
const itemsSchema = new mongoose.Schema({
  name: String,
});
 
const Item = mongoose.model("Item", itemsSchema);
 
const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3];
 
const listSchema = {
  name: String,
  items: [itemsSchema]
};
 
const List = mongoose.model("List", listSchema);
 
 
app.get("/", function(req, res) {
 
  //res.render("list", {listTitle: "Today", newListItems: foundItems})
 
  Item.find({})
    .then(foundItems => {
 
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems).then(function () {
          console.log("Successfully saved default items to DB");
        })
        .catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
 
    })
    .catch(err => {
      console.error(err);
    });
 
});
 
 
app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
 
  List.findOne({name: customListName})
    .then(foundList => {
      if(!foundList){
 
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    })
    .catch((err) => {
      console.log(err);
    });
 
 
});
 
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
 
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name : listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});
 
app.post("/delete", async function (req, res) {
  let id = req.body.checkbox;
  let listName = req.body.listName.toLowerCase();
  if(listName === "today"){
      try {
          const item = await Item.findByIdAndDelete(id);
      } catch (err) {
          console.log(err);
      }
      return res.redirect("/");
  }
  let foundList = await List.findOne({name: listName}).exec();
  foundList.items.pull({_id: id});
  foundList.save();
  return res.redirect("/"+listName);
});
 

 
 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});