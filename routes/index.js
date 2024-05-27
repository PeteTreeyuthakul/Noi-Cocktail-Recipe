const { Router } = require("express");
const router = Router();

router.use("/items", require('./itemsRoute'));
router.use("/users", require('./usersRoute'));
router.use("/menus", require('./menuRoute'));

router.get('/', (req, res, next) => {
    res.status(200).send('Noi-Cocktail-Recipe')
});

router.use((err,req, res, next)=>{
    console.error(err.stack)
    res.status(500).send('Internal server error')
})

module.exports = router;