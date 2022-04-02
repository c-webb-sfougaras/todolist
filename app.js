const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const { request } = require("express");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-christina:test123@cluster0.zxqk9.mongodb.net/todolistDB")

const d = new Date()
const formattedDate = d.toDateString()



const itemSchema = {
  name: String
};

const Item = mongoose.model("item", itemSchema)

const createToDo = new Item ({
  name: "Create your first 'to do'..."
});



const defaultItems = [createToDo]

const listSchema ={
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (err){
      console.log(err)
    } else {
      if (foundItems.length === 0){
        Item.insertMany(defaultItems, function(err) {
          if (err){console.log(error)
          } else {
            console.log("Successfully added default items to DB")
          }
          res.render("list", {listTitle: formattedDate, newListItems: foundItems});
        })
      } else {
        res.render("list", {listTitle: formattedDate, newListItems: foundItems});
        
      }
    }
  })
});


app.post("/", function(req, res){
  const itemName = req.body.newItem
  const listName = req.body.listName

  const item = new Item ({
    name: itemName
  })
 
    if (listName === formattedDate){
      item.save()
      res.redirect("/")
    } else {
      List.findOne({name: listName}, function(err, foundList){
        if (!err){

        foundList.items.push(item)
        foundList.save();
        res.redirect("/" + listName)
        }
      })
    }  
  }
  
);

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName;
  console.log(listName)

  if(listName === formattedDate) {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err)
      } else {
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/"  + listName)
      }
    })
  }
  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
    if (!foundList){
      const list = new List({
        name: customListName,
        items:defaultItems
      })
      list.save()
      res.redirect("/" + customListName)
    } else {
     res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  }
  })


  
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server has started successfully");
});
