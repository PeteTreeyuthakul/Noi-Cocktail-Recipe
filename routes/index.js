const { Router } = require("express");
const router = Router();

router.use("/items", require('./itemsRoute'));
router.use("/users", require('./usersRoute'));
router.use("/menus", require('./menuRoute'));

// Route to intentionally cause an error for testing
router.get('/', (req, res, next) => {
    res.status(200).send('Noi-Cocktail-Recipe')
});

router.use((err,req, res, next)=>{
    console.error(err.stack)
    res.status(500).send('Internal server error')
})

router.use((req, res, next) => {
    console.log(error)
    res.status(404).send('Not Found');
});

module.exports = router;