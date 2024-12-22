const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [3, "Name must be at least 3 characters long"],
  },
  number: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d{7,}$/.test(v); // Ensimmäinen osa: 2-3 numeroa, toinen osa: vähintään 7 numeroa
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Correct format: XX-XXXXXXX or XXX-XXXXXXX`,
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
