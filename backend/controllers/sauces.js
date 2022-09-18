// CONTROLLER SAUCES
const Sauce = require('../models/sauces')
const fs = require('fs');

// AFFICHE TOUTES LES SAUCES
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// CREER UNE SAUCE
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
};

// RECUPERE UNE SAUCE
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

// MODIFIER UNE SAUCE
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
                .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// SUPPRIMER UNE SAUCE
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id}).then(
        (sauce) => {
            if (!sauce){
                return res.status(404).json({ 
                    erorr: new Error('Sauce non trouvée !')
                });
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(401).json({ 
                    error: new error('Requête non autorisée !')
                });
            }
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                        .catch(error => res.status(400).json({ error }));
                });
                })
                .catch(error => res.status(500).json({ error }));
        }
    );
};

// LIKE/DISLIKE BOUTTONS
exports.likeSauce = (req, res, next) => {
    let userId = req.body.userId; // UserID de l'utilisateur
    let sauceId = req.params.id; // sauceID de la sauce
    let like = req.body.like; // Récupération de la requête like (1,0 ou -1)

    Sauce.findOne({ _id: sauceId }) // Récupération de la sauce
    .then((sauce) => { 
        switch (like) {
            case 1: // Si bouton liké
                Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 }}) 
                // Push l'userId dans l'Array usersLiked et incrémente de 1 likes
                .then(() => res.status(200).json({ message: 'Sauce liké !'}))
                .catch(error => res.status(401).json({ error }));
            break;
            case -1: 
                Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 }})
                // Push l'userId dans l'Array usersDisliked et incrémente de 1 dislikes
                .then(() => res.status(200).json({ message: 'Sauce disliké !'}))
                .catch(error => res.status(401).json({ error }));
            break;
            case 0: 
                // Si userID dans un des Array, pull (retiré) l'userId et décrémenter
                if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 }})
                    .then(() => res.status(200).json({ message: 'Like retiré !'}))
                    .catch(error => res.status(401).json({ error }));
                }
                if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 }})
                    .then(() => res.status(200).json({ message: 'Dislike retiré !'}))
                    .catch(error => res.status(401).json({ error }));
                }
            break;
            default:
                // Erreur si pas (1,0 ou -1)
                console.log(erorr);
            break;
        }
    })
    .catch(error => res.status(404).json({ error }));
};