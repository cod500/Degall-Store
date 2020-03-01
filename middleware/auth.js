const ensureAuth = (req, res, next) =>{
    if(req.isAuthenticated()){
        return next()
    }
    req.flash('error_msg', 'Must be logged in')
    res.redirect('/');
}

const ensureAdmin = (req, res, next) =>{
    if(req.isAuthenticated()){
        if(req.user.admin === 1){
            return next()
        }
    }
    req.flash('error_msg', 'Must be logged in as admin')
    res.redirect('/')
}

module.exports = {ensureAuth, ensureAdmin};