var db = firebase.firestore();
//function which calls all essential functions in this file
//it gets the ratings and their ratinginfo from the database and draws the aggregates and a ratinginput
async function startupRatings(Bpid) {
    [ratinglist, ratinginfo] = await getratings(BPid);
    //transpose the ratings so that every item in the array contains scores belonging to one dimension
    let transposedScores = await Promise.resolve(transposeScores(ratinglist));
    //transpose the ratinginfo so that every item in the array contains all info on one rating dimension
    let transposedInfo = await Promise.resolve(transposeInfo(ratinginfo));
    //set up rating section skeleton
    [topOfratingSegment, ratinginputlocation, individualratinglocation] = setUpRatingSection(transposedInfo, document.getElementById('ratingsection'));
    //create total rating aggregation to be placed on top of the rating section to allow for quick identification of the score
    createTotalAggregation(topOfratingSegment, transposedScores, transposedInfo);
    //create rating input based on ratingdocument
    createRatingInput(ratinginputlocation, Bpid, transposedInfo, individualratinglocation);
    //create rating aggregations based on scores and ratingdocument
    if (transposedInfo.length > 1) {
        createRatingAggregation(transposedScores, transposedInfo);
    }
    //draw all individual ratings
    await createAllRatings(individualratinglocation, ratinglist, transposedInfo, Bpid);
    return new Promise((resolve)=>{
        resolve();
    });
}

function setUpRatingSection(transposedInfo, root) {
    var ratingAggregationTop = document.createElement('div');
    ratingAggregationTop.id = "ratingaggregation";
    root.appendChild(ratingAggregationTop);

    //if there is more than one rating dimension
    if (transposedInfo.length > 1) {

        var ratingCollapsible = document.createElement('button');
        ratingCollapsible.classList.add('btn', 'btn-light', 'btn-icon-split');
        ratingCollapsible.style.justifyContent = 'left';

        ratingCollapsible.addEventListener("click", function () { togglevisibility(detailwrapper); changeicon(iconinstantiation) });
        ratingCollapsible.style.width = '100%';
        ratingCollapsible.style.display = 'flex';

        var icon = document.createElement('span');
        icon.classList.add('icon', 'text-gray-600');

        var iconinstantiation = document.createElement('i');
        iconinstantiation.classList.add('fas', 'fa-sort-down');
        icon.appendChild(iconinstantiation);

        var dimname = document.createElement('h5');
        dimname.innerText = "Give your rating here!";
        dimname.style.width = '25%';
        dimname.style.marginLeft = '10%';
        dimname.style.marginRight = 'auto';
        dimname.style.textAlign = 'initial'
        dimname.style.marginBottom = 'auto';
        dimname.style.marginTop = 'auto';

        ratingCollapsible.appendChild(dimname);
        ratingCollapsible.appendChild(icon);

        var detailwrapper = document.createElement('div');
        detailwrapper.id = 'ratinginput';
        detailwrapper.style.display = "none";

        root.appendChild(ratingCollapsible);
        root.appendChild(detailwrapper);

        var buttonbar = document.createElement('div');
        buttonbar.classList.add('buttonbar');

        var individualRatings = document.createElement('button');
        individualRatings.classList.add('btn', 'btn-light');
        individualRatings.style.marginRight = '10px';
        individualRatings.innerText = 'Individual ratings';
        individualRatings.selected = true;
        individualRatings.addEventListener('click', function () { makeinvisible('Aggregated-ratings', 'Individual-ratings') });
        buttonbar.appendChild(individualRatings);

        var aggregatedRatings = document.createElement('button');
        aggregatedRatings.classList.add('btn', 'btn-light');
        aggregatedRatings.innerText = "Aggregated ratings";
        aggregatedRatings.addEventListener('click', function () { makeinvisible('Individual-ratings', 'Aggregated-ratings') });
        buttonbar.appendChild(aggregatedRatings);

        root.appendChild(buttonbar);

        var individualRatingsContainer = document.createElement('div');
        individualRatingsContainer.id = "Individual-ratings";
        root.appendChild(individualRatingsContainer);

        var aggregatedRatingsContainer = document.createElement('div');
        aggregatedRatingsContainer.id = "Aggregated-ratings";
        aggregatedRatingsContainer.style.display = 'none';
        root.appendChild(aggregatedRatingsContainer);

        return [ratingAggregationTop, detailwrapper, individualRatingsContainer];
    }
    else {
        return [ratingAggregationTop, ratingAggregationTop, ratingAggregationTop];
    }

}
//function to create the rating input to be used by the user.
function createRatingInput(root, BPid, list, individualratinglocation) {
    var ratingcontainer = document.createElement("div");
    ratingcontainer.classList.add("wrapper");

    let divider = document.createElement("hr");
    root.appendChild(divider)
    var ratinglabel = document.createElement('h5');
    ratinglabel.innerText = "Give your rating below";
    ratinglabel.style.marginBottom = '0px';
    ratinglabel.style.marginLeft = '10%';
    ratingcontainer.appendChild(ratinglabel);

    var ratingdimensions = [];
    for (mechanism of list) {
        var rating = createRating(ratingcontainer, mechanism[0], mechanism[1], mechanism[2], mechanism[3], mechanism[4], mechanism[5], mechanism[6]);
        ratingdimensions.push(rating);
    }
    //textlabel 'Explaination (optional)'
    let textlabel = document.createElement('p');
    textlabel.innerText = "Explaination (optional)";
    textlabel.style.marginBottom = '0px';
    textlabel.style.marginLeft = '10%';
    ratingcontainer.appendChild(textlabel);

    //create text input area
    textinput = createTextArea();

    //create submitbutton
    let submitbutton = document.createElement("button");
    submitbutton.innerText = "Submit";
    submitbutton.style.float = 'right';
    submitbutton.style.marginBottom = '1em';
    submitbutton.classList.add("btn", "btn-light");

    submitbutton.addEventListener("click", async function () {
        let ratings = collectrating(ratingdimensions)
        addactivity(userEmail, 'make rating', BPid, getcurrentDateTime())
        if (ratings.includes(null)) {
            alert("Please select a value for your rating before submitting your rating");
        }
        else {
            let docid = await getRatingOfCurrentUser();
            if (docid) {
                removeRating(BPid, docid, document.getElementById(docid));
            }
            submitrating(BPid, ratings, textinput.value, list, individualratinglocation);
            alert("Your review has been posted! refresh this page to see its impact on the ratings average score");
        }
    })

    let textinput_ = document.createElement("div");
    textinput_.style.marginBottom = '1em';
    textinput_.style.height = 'auto';
    textinput_.style.width = '80%';
    textinput_.style.margin = 'auto';
    
    textinput_.appendChild(textinput);
    textinput_.appendChild(submitbutton);
    root.appendChild(ratingcontainer);
    root.appendChild(textinput_);
}
function removeRating(BPid, RatingID, RatingContainer) {
    startstring = findPath(collectionPaths, 'bestpractices') + '/';
    endstring = "/ratings"
    totalstring = startstring.concat(BPid, endstring);
    db.collection(totalstring).doc(RatingID).delete();
    if (RatingContainer) {
        removeElement(RatingContainer);
    }
}
//function for submitting a rating to the database
function submitrating(BPid, scores, text, dimensioninfo, root) {
    now = getcurrentDateTime();
    startstring = findPath(collectionPaths, 'bestpractices') + '/';
    endstring = "/ratings";
    doelstring = startstring.concat(BPid, endstring);
    db.collection(doelstring).add({
        //write rating to db
        date: getcurrentDateTime(),
        author: getUserName(),
        img: getUserImage(),
        email: getUserEmail(),
        rating: scores,
        ratingtext: text
    }).then(docRef => {
        //draw rating locally
        drawRating(getUserName(), getTimeDifference(now, getcurrentDateTime()), scores, getUserImage(), docRef.id, BPid, isSame(email), root, dimensioninfo, text);
    })

}
//function to retrieve all ratings and the ratingdocument from the database
async function getratings(BPid) {
    var ratinglist = [];
    var ratinginfo = [];
    let startstring = findPath(collectionPaths, 'bestpractices') + '/';
    let endstring = "/ratings"
    let doelstring = startstring.concat(BPid, endstring);
    let now = getcurrentDateTime();
    // Getting a reference to all documents in the comment sub-collection for a best practice
    let documents = await db.collection(doelstring).get();
    // Each document that matches the query is cycled through
    await documents.docs.forEach((doc) => {
        // for every rating get de relevant info     
        if (doc.id != "ratingdocument") {
            rating_date = getTimeDifference(now, doc.data().date);
            rating_author = doc.data().author;
            rating_img = doc.data().img;
            rating_score = doc.data().rating;
            rating_email = doc.data().email;
            rating_id = doc.id;
            text = doc.data().ratingtext;
            ratinglist.push([rating_author, rating_date, rating_score, rating_img, rating_email, rating_id, text]);
        }
        // get rating information on the dimensions
        else {
            rating_type = doc.data().ratingtype;
            rating_scale = doc.data().scale;
            rating_dimensions = doc.data().dimension;
            rating_dimensions_descr = doc.data().dimensiondescription;
            rating_stepsize = doc.data().stepsize;
            ratinginfo.push([rating_type, rating_dimensions, rating_scale, rating_stepsize, rating_dimensions_descr]);
        }
    })
    return [ratinglist, ratinginfo[0]];
}
//function for creating ther fitting aggregation per dimension (links to ratingaggregationswitch)
async function createRatingAggregation(scorelist, ratingdimensions) {
    for (var i = 0; i < ratingdimensions.length; i++) {
        let ratingdimension = await ratingdimensions[i]
        let ratingdimension_type = await ratingdimension[0];
        let ratingdimension_name = await ratingdimension[1];
        let ratingdimension_scale = await ratingdimension[2];
        let ratingdimension_step = await ratingdimension[4];
        if (scorelist.length > 0) {
            var scores = await scorelist[i].map(numStr => parseInt(numStr));
        }
        else {
            var scores = []
        }
        //call the fitting method for aggregation
        ratingaggregationswitch(scores, ratingdimension_name, ratingdimension_type, ratingdimension_scale, ratingdimension_step);
    }
}
//function for selecting the fitting aggregation per dimension
async function ratingaggregationswitch(scores, ratingdimension_name, ratingdimension_type, ratingdimension_scale, ratingdimension_step) {
    switch (ratingdimension_type) {
        case 'stars':
            displayAggregation(document.getElementById("Aggregated-ratings"), scores, ratingdimension_name, ratingdimension_scale, ratingdimension_step, 'stars');
            break;
        case 'slider':
            displayAggregation(document.getElementById("Aggregated-ratings"), scores, ratingdimension_name, ratingdimension_scale, ratingdimension_step, 'slider');
            break;
        case 'binstars':
            displayAggregation(document.getElementById("Aggregated-ratings"), scores, ratingdimension_name, ratingdimension_scale, ratingdimension_step, 'binstars');
    }
}
//function for extracting the ratings per dimention from the varying rating mechanisms.
function collectrating(listOfDimensions) {
    var scorelist = [];
    var score = 0
    for (dimension of listOfDimensions) {
        //get score
        switch (dimension.getAttribute("name")) {
            case "stars":
                score = dimension.getAttribute("data-rating");
                break;
            case "slider":
                score = dimension.value;
                break;
            case "binstars":
                score = dimension.getAttribute("data-rating");
                break;
            case "dislikelike":
                score = dimension.getAttribute("data-rating");
                if (score == 0) { score = null }
                break;
            case "like":
                break;
            case "eBay":
                score = dimension.getAttribute("data-rating");
                if (score == 'null') { score = null }
                break;
        }
        scorelist.push(score);
    }
    return scorelist;
}
//function to create any rating mechanism in 1 dimension
//this function calls the main functions of each mechanism which is based in their respective JavaScript files
//this function is called for each dimension which is listed in the rating document.
//root      -> element below which the rating mechanism should be pasted
//name      -> name of the rating mechanism e.g. binary stars, stars
//dimension -> name of the dimension e.g. reproducibility
//scale     -> scale of the rating this can be the amount of stars or the max of the slider
//type      -> readonly or input
//value     -> default value or calculated value from aggregating function
function createRating(root, name, dimension, scale, type, step, value, descr) {

    var container = document.createElement("div");
    container.classList.add("ratingcontainer");
    container.style.marginLeft = '10%';
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.flexWrap = 'wrap';

    var info = document.createElement("div");
    info.classList.add("far", "fa-question-circle", "questionicon", "couponcode");

    var tt = document.createElement("span");
    tt.classList.add("coupontooltip");
    info.appendChild(tt);
    tt.innerHTML = descr;

    var label = document.createElement("p");
    label.innerText = dimension;
    label.classList.add("label");

    container.appendChild(label);
    container.appendChild(info);

    switch (name) {
        //dislikelike
        case "dislikelike":
            var ratingmech = createLikeDislikeRating(container);
            break;
        //like
        case "like":
            var ratingmech = createlikeRating(container);
            break;
        //eBay
        case "eBay":
            var ratingmech = createEbayRating(container);
            break;
        //stars
        case "stars":
            var ratingmech = createStarRating(container, scale, value);
            break;
        //slider
        case "slider":
            var ratingmech = createbarrating(container, 0, scale, step, 0, type);
            break;
        //binstars
        case "binstars":
            var ratingmech = createBinaryStarRating(container, scale, scale, 'input', 0, 3);
            break;
    }
    root.appendChild(container);
    return ratingmech;
}
//function to draw all ratings recorded in the database
//this function calls drawRating to draw all ratings
async function createAllRatings(root, ratinglist, transposedInfo, BPid) {
    for (rating of ratinglist) {
        let name = rating[0];
        let date = rating[1];
        let score = rating[2];
        let img = rating[3];
        let email = rating[4];
        let id = rating[5];
        let text = rating[6];
        drawRating(name, date, score, img, id, BPid, isSame(email), root, transposedInfo, text);
    }
    return new Promise((resolve)=>{
        resolve();
    });
}

//function to draw one instance of a rating, this rating has the same interface as the comments from comment.js
function drawRating(name, date, text, img, ratingid, BP_id, isSame, root, dimensioninfo, ratingtext) {
    // rating wrapper e.g. the wrapper for all the comments contents
    var rating_wrapper = document.createElement("DIV");
    rating_wrapper.id = ratingid;
    rating_wrapper.classList.add("comment_wrapper");

    //content wrapper
    var content_wrapper = document.createElement("DIV");
    content_wrapper.classList.add("content");

    //topbar wrapper, wrapper for the meta info and toolbar
    var topbar_wrapper = document.createElement("DIV");
    topbar_wrapper.classList.add("containertopbar");

    //meta info wrapper, name, date, etc.
    var meta_info_wrapper = document.createElement("DIV");
    meta_info_wrapper.classList.add("meta_info");

    //meta info wrapper, name, date, etc.
    var meta_info_wrapper_img = document.createElement("DIV");
    meta_info_wrapper_img.classList.add("meta_info_wrapper");

    //toolbar wrapper, delete, edit, flag, etc.
    var toolbar_wrapper = document.createElement("DIV");
    toolbar_wrapper.classList.add("toolbar_wrapper");

    //toolbar wrapper for comment utilities under the comment text, confirm edit, cancel edit, show entire comment.
    var bottomtoolbar_wrapper = document.createElement("DIV");
    bottomtoolbar_wrapper.classList.add("bottomtoolbar");

    //picture
    var picture = document.createElement("img");
    picture.src = img;
    picture.classList.add("picture");
  
    //author name
    var name_text = document.createElement("p");
    name_text.classList.add("name");
    name_text.innerText = name;

    //comment date, e.g. 5 minutes ago...
    var date_posted_text = document.createElement("p");
    date_posted_text.classList.add("date_poster");
    date_posted_text.innerText = date;

    //the rating text itself
    var comment_text = document.createElement("p");
    comment_text.innerText = ratingtext;

    
    //if current user is the same as the rater he can remove or edit the rating
    if (isSame == "true") {
        //remove rating component
        var remove_comment = document.createElement("i");
        remove_comment.classList.add("fa", "fa-trash", "remove_button");
        toolbar_wrapper.appendChild(remove_comment);
        remove_comment.addEventListener("click", function () {
            // ask for confirmation that a user indeed wants to delete his comments
            if (confirm("Are you sure you want to delete this rating?") == true) {
                removeRating(BP_id, ratingid, rating_wrapper);
            }
        });
    }

    //add comment author and date to the meta info wrapper
    meta_info_wrapper.appendChild(name_text);
    meta_info_wrapper.appendChild(date_posted_text);

    meta_info_wrapper_img.appendChild(picture);
    meta_info_wrapper_img.appendChild(meta_info_wrapper)

    //add meta info and the toolbar to the topbar
    topbar_wrapper.appendChild(meta_info_wrapper_img);
    topbar_wrapper.appendChild(toolbar_wrapper);

    //add topbar in the content wrapper
    content_wrapper.appendChild(topbar_wrapper);

    //display the users ratings
    createUserRatingDisplay(content_wrapper, text, dimensioninfo);

    if (ratingtext) {
        content_wrapper.appendChild(comment_text);
    }
    //paste content into the comment wrapper
    rating_wrapper.appendChild(content_wrapper);
    root.appendChild(rating_wrapper);
}

//function to get occurences of ratings 
function organizelist(arr, max, stepsize, type) {
    var a = [], b = [], prev, pos = [], neg = [];
    arr.sort();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] !== prev) {
            a.push(arr[i]);
            b.push(1);
            if (type == "binstar") {
                if (arr[i] > 0) {
                    pos.push(arr[i]);
                }
                else if (arr[i] < 0) {
                    neg.push(arr[i]);
                }
            }
        } else {
            b[b.length - 1]++;
        }
        prev = arr[i];
    }
    const zip = (arr1, arr2) => arr1.map((k, i) => [k, arr2[i]]);
    incompleteList = zip(a, b); // create frequence tuple list of the array

    if (type != "binstar") {
        for (n of numbersBetweenAandBwithFactorC(1, max, stepsize)) { // add the individual tuples with no occurences withing the arrays range (include a (2,0) tuple if 2 never occurs in the array)
            if (!a.includes(n)) {
                incompleteList.push([n, 0]);
            }
        }
    }
    else {
        for (n of numbersBetweenAandBwithFactorC(-max, max, 1)) { // add the individual tuples with no occurences withing the arrays range (include a (2,0) tuple if 2 never occurs in the array)
            if (!a.includes(n) && n != 0) {
                incompleteList.push([n, 0]);
            }
        }
    }
    const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    if (type != 'binstar') {
        return [incompleteList.sort(Comparator), max, Math.round(arrAvg(arr) * 10) / 10];
    }
    else {
        return [incompleteList.sort(Comparator), max, Math.round(arrAvg(arr) * 10) / 10, Math.round(arrAvg(pos) * 10) / 10, pos.length, Math.round(arrAvg(neg) * 10) / 10, neg.length];
    }
}
//function for displaying the readOnly mechanisms in the individual user reviews
function createUserRatingDisplay(root, scores, dimension) {

    var icon = document.createElement('span');
    icon.classList.add('icon', 'text-gray-600');

    var iconinstantiation = document.createElement('i');
    iconinstantiation.classList.add('fas', 'fa-sort-down');

    var dimname = document.createElement('p');
    dimname.innerText = "Average score";
    dimname.style.marginBottom = '0px';
    dimname.style.marginRight = '1em';


    if (scores.length > 1) {
        var ratingCollapsible = document.createElement('button');
        ratingCollapsible.classList.add('btn', 'btn-light', 'btn-icon-split');
        ratingCollapsible.style.justifyContent = 'left';
        ratingCollapsible.style.width = '100%';
        ratingCollapsible.style.display = 'flex';
        ratingCollapsible.appendChild(dimname);
        root.appendChild(ratingCollapsible);
        ratingCollapsible.addEventListener("click", function () { togglevisibility(detailwrapper); changeicon(iconinstantiation) });
        var detailwrapper = document.createElement('div');
        detailwrapper.style.display = "none";

        var list = [];
        var type = [];
        for (i in scores) {
            let score = scores[i];
            let dimensionsub = dimension[i];
            let maxval = dimensionsub[2];
            type.push(dimensionsub[0]);
            //get percentage of score. this indicates a quality
            list.push(score / maxval);
        }
        const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
        switch (type[0]) {
            case 'slider':
                createbarrating(ratingCollapsible, 0, 100, 1, arrAvg(list) * 100, "readOnly");
                var ratingavg = document.createElement('p');
                ratingavg.innerText = Math.round(arrAvg(list) * 100 * 10) / 10 + ' / ' + 100;
                ratingavg.style.width = '25%';
                ratingavg.style.marginRight = 'auto';
                ratingavg.style.marginBottom = 'auto';
                ratingavg.style.marginTop = 'auto';
                ratingCollapsible.appendChild(ratingavg);
                break;
            case 'stars':
                starRatingResult(ratingCollapsible, arrAvg(list) * 100, 5);
                var ratingavg = document.createElement('p');
                // below the amount of stars on 1 decimal is calculated
                ratingavg.innerText = Math.round((arrAvg(list) * 5) * 10) / 10 + ' / ' + 5;
                ratingavg.style.marginBottom = '0px';
                ratingCollapsible.appendChild(ratingavg);
                break;
            case 'binstars':
                let score = (arrAvg(list));
                if (arrAvg(list) > 0) {
                    let binstar = createBinaryStarRating(ratingCollapsible, 5, 5, "readOnly", 0, score * 5);
                    binstar.style.marginRight = 'auto';
                }
                else {
                    let binstar = createBinaryStarRating(ratingCollapsible, 5, 5, "readOnly", score * 5, 0);
                    binstar.style.marginRight = 'auto';
                }
                break;

        }
        icon.appendChild(iconinstantiation);
        ratingCollapsible.appendChild(icon);

        for (i in scores) {
            let score = scores[i];
            let dimensionsub = dimension[i];
            let ratingtype = dimensionsub[0];
            let dimensionname = dimensionsub[1];
            let maxval = dimensionsub[2];
            let step = dimensionsub[4];

            var div = document.createElement('div');
            div.style.display = 'flex';

            var dimensionlabel = document.createElement('p');
            dimensionlabel.innerText = dimensionname;
            dimensionlabel.style.marginRight = '1em';
 
            div.appendChild(dimensionlabel);

            switch (ratingtype) {
                case 'slider':
                    createbarrating(div, 0, maxval, step, score, "readOnly");
                    var ratingavg = document.createElement('p');
                    ratingavg.innerText = score + ' / ' + maxval;
                    ratingavg.style.width = '25%';
                    ratingavg.style.textAlign = 'center';
                    ratingavg.style.marginBottom = 'auto';
                    ratingavg.style.marginTop = 'auto';
                    div.appendChild(ratingavg);
                    break;

                case 'stars':
                    createStarRating(div, maxval, score, "readOnly");
                    break;

                case 'binstars':
                    if (score > 0) {
                        createBinaryStarRating(div, maxval, maxval, "readOnly", 0, score);
                    }
                    else {
                        createBinaryStarRating(div, maxval, maxval, "readOnly", score, 0);
                    }
                    break;
            }
            detailwrapper.appendChild(div);
        }
        root.appendChild(detailwrapper);


    }
    else {

        var ratingCollapsible = document.createElement('div');
        ratingCollapsible.style.justifyContent = 'center';
        ratingCollapsible.style.display = 'flex';
        ratingCollapsible.style.flexWrap = 'wrap';
        ratingCollapsible.style.flexDirection = 'row';
        ratingCollapsible.style.bottom = '1em';
        ratingCollapsible.appendChild(dimname);
        root.appendChild(ratingCollapsible);

        let dimensionsub = dimension[0];
        let ratingtype = dimensionsub[0];
        let dimensionname = dimensionsub[1];
        let maxval = dimensionsub[2];
        let step = dimensionsub[4];
        let score = scores[0];
        dimname.innerText = dimensionname;
        switch (ratingtype) {
            case 'slider':
                createbarrating(ratingCollapsible, 0, maxval, step, score, "readOnly");
                var ratingavg = document.createElement('p');
                ratingavg.innerText = score + ' / ' + maxval;
                ratingavg.style.marginBottom = '0px';
                ratingCollapsible.appendChild(ratingavg);
                break;
            case 'stars':
                stars = starRatingResult(ratingCollapsible, (score / maxval) * 100, 5);
                stars.style.marginRight = '1em';
                var ratingavg = document.createElement('p');
                // below the amount of stars on 1 decimal is calculated
                ratingavg.innerText = score + ' / ' + 5;
                ratingavg.style.marginBottom = '0px';
                ratingCollapsible.appendChild(ratingavg);
                break;
            case 'binstars':
                if (score > 0) {
                    let binstar = createBinaryStarRating(ratingCollapsible, max, max, "readOnly", 0, score);
                    binstar.style.marginRight = 'auto';
                }
                else {
                    let binstar = createBinaryStarRating(ratingCollapsible, max, max, "readOnly", score, 0);
                    binstar.style.marginRight = 'auto';
                }
                break;
            case 'dislikelike':
                if (score > 0) { createLike(ratingCollapsible) }
                else if (score < 0) { createDislike(ratingCollapsible) }
                break;
            case 'eBay':
                if (score == 1) { createPositiveOption(ratingCollapsible); }
                else if (score == 0) { createNeutralOption(ratingCollapsible); }
                else if (score == -1) { createNegativeOption(ratingCollapsible); }
                break;
            case 'like':
                createLike(ratingCollapsible);

                break;

        }

    }
}
function displayAggregation(root, listofscores, dimension, scale, step, type) {
    if (listofscores.length > 0) {

        if (type == 'binstars') {
            var [scorelist, max, avg, pAVG, pAmt, nAvg, nAmt] = organizelist(listofscores, scale, step, "binstar");
            if (!pAmt) { pAmt = 0; }
            if (!nAmt) { nAmt = 0; }
            if (!pAVG) { pAVG = 0; }
            if (!nAvg) { nAvg = 0; }
        }
        else {
            var [scorelist, max, avg] = organizelist(listofscores, scale, step);
        }
    }
    else {
        scorelist = [];
        max = scale;
        avg = 0;
        pAVG = 0;
        nAvg = 0;
        pAmt = 0;
        nAmt = 0;
    }

    var ratingCollapsible = document.createElement('button');
    ratingCollapsible.classList.add('btn', 'btn-light', 'btn-icon-split');
    ratingCollapsible.style.justifyContent = 'left';

    ratingCollapsible.addEventListener("click", function () { togglevisibility(detailwrapper); changeicon(iconinstantiation) });
    ratingCollapsible.style.width = '100%';
    ratingCollapsible.style.display = 'flex';

    var icon = document.createElement('span');
    icon.classList.add('icon', 'text-gray-600');

    var iconinstantiation = document.createElement('i');
    iconinstantiation.classList.add('fas', 'fa-sort-down');

    var dimname = document.createElement('p');
    dimname.innerText = dimension;
    dimname.style.marginBottom = '0';
    dimname.style.marginRight = '1em';
    ratingCollapsible.appendChild(dimname);
    if (type == 'slider') {
        createbarrating(ratingCollapsible, 0, max, step, Math.round(avg), "readOnly");
    }
    else if (type == 'stars') {
        starRatingResult(ratingCollapsible, ((avg / max) * 100), max);
    }
    else if (type == 'binstars') {
        let binstar = createBinaryStarRating(ratingCollapsible, max, max, "readOnlyAgg", nAvg, pAVG, pAmt, nAmt);
        binstar.style.marginRight = 'auto';
    }

    var ratingavg = document.createElement('p');
    ratingavg.innerText = avg + ' / ' + max;
    ratingavg.style.width = '20%';
    ratingavg.style.marginBottom = 'auto';
    ratingavg.style.marginTop = 'auto';
    ratingavg.style.marginRight = 'auto';
    if (type != 'binstars') {
        ratingCollapsible.appendChild(ratingavg);
    }

    icon.appendChild(iconinstantiation);
    ratingCollapsible.appendChild(icon);
    var detailwrapper = document.createElement('div');
    detailwrapper.style.display = "none";

    ratingdecr = document.createElement('p');
    ratingdecr.innerText = avg + " average based on " + listofscores.length + " ratings";
    ratingdecr.style.marginBottom = '0px';
    ratingdecr.style.marginTop = '10px';
    ratingdecr.classList.add('toptext');

    detailwrapper.appendChild(ratingdecr);
    if (scorelist.length > 0) {
        var topbar = document.createElement('div');
        topbar.style.display = "flex";
        topbar.style.marginBottom = "10px";
        var t1 = document.createElement('p');
        t1.innerText = "Score";
        t1.style.marginBottom = '0px';
        t1.style.width = '10%';
        t1.style.textAlign = 'center';
        var t2 = document.createElement('p');
        t2.innerText = "Percentage";
        t2.style.marginBottom = '0px';
        t2.style.width = '75%';
        t2.style.textAlign = 'center';
        var t3 = document.createElement('p');
        t3.innerText = "Amount";
        t3.style.marginBottom = '0px';
        t3.style.width = '15%';
        t3.style.textAlign = 'center';
        topbar.appendChild(t1);
        topbar.appendChild(t2);
        topbar.appendChild(t3);
        detailwrapper.appendChild(topbar);
    }
    for (score of scorelist) {
        var containerwrapper = document.createElement('div');
        containerwrapper.style.display = "flex";
        containerwrapper.style.marginBottom = '5px';

        var scoretext = document.createElement('p');
        scoretext.classList.add("scoretext");
        scoretext.innerText = score[0];// rating score
        scoretext.style.width = '10%';
        scoretext.style.textAlign = 'center';

        var barwrapper = document.createElement("div");
        barwrapper.style.width = '75%';
        barwrapper.style.border = '1px solid black';
        var bar = document.createElement("div");
        var percent = (score[1] / listofscores.length) * 100;// calculate the percentage of the occurences of a certain score compared to the amount of scores.

        bar.style.width = percent + '%';
        bar.style.height = '100%';
        bar.style.background = 'rgb(69, 145, 72)';

        var frequencytext = document.createElement('p');
        frequencytext.innerText = score[1] + ' (' + Math.round(percent) + '%)';// rating frequency and percentage
        frequencytext.classList.add("scoretext");
        frequencytext.style.width = '15%';
        frequencytext.style.textAlign = 'center';

        containerwrapper.appendChild(scoretext);
        barwrapper.appendChild(bar);
        containerwrapper.appendChild(barwrapper);
        containerwrapper.appendChild(frequencytext);
        detailwrapper.appendChild(containerwrapper);
    }
    root.appendChild(ratingCollapsible);
    root.appendChild(detailwrapper);
    return detailwrapper;

}
// supporting function for getting an array from all integers between lowEnd and highEnd
function numbersBetweenAandB(lowEnd, highEnd) {
    var list = [];
    for (var i = lowEnd; i <= highEnd; i++) {
        list.push(i);
    }
    return list;
}
// supporting function for getting an array from all numbers between lowEnd and highEnd with interval factor
function numbersBetweenAandBwithFactorC(lowEnd, highEnd, factor) {
    var list = [];
    for (var i = lowEnd; i <= highEnd; i++) {
        if (((i / factor) - Math.floor(i / factor)) == 0) {
            list.push(i);
        }
    }
    return list;
}

// supporting function for transposing the array of arrays of the ratinginfo
// [['sustainability','savings','fun'] , [1,2,3]] -> [['sustainability',1],['savings',2],['fun',3]]
function transposeInfo(list) {
    let returnlist = [];
    let types = list[0];
    let ratingdim = list[1];
    let ratingscale = list[2];
    let stepsize = list[3];
    let descr = list[4];

    for (i of numbersBetweenAandB(0, types.length - 1)) {
        let listitem = [types[i], ratingdim[i], ratingscale[i], 'input', stepsize[i], 1, descr[i]];
        returnlist.push(listitem);
    }
    return returnlist;
}
//function to extract the scores from tatings and transpose them so they are grouped by dimension
function transposeScores(list) {
    var scorelength = 0;
    var definitivescorelist = [];
    var intermediatescorelist = [];
    //extract all ratings
    for (rating of list) {
        intermediatescorelist.push(rating[2]);
        scorelength = rating[2].length;
    }
    //transpose the ratings to group the ratings by dimension
    for (i of numbersBetweenAandB(0, scorelength - 1)) {
        var iList = [];
        for (score of intermediatescorelist) {
            iList.push(score[i]);
        }
        definitivescorelist.push(iList)
    }
    return definitivescorelist;
}
// helper function to transpose an array of arrays
// similar to transposeInfo but this function is more abstract and can be used on all arrays
function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}
// function for removing all rating related items
function remove_rating_elements() {
    myNodes = [document.getElementById('ratingsection')];
    for (myNode of myNodes) {
        while (myNode.hasChildNodes()) {
            myNode.removeChild(myNode.firstChild);
        }
    }
}
//supporting function for ordering a list of tuples on its 1st element 
function Comparator(a, b) {
    if (a[0] > b[0]) return -1;
    if (a[0] < b[0]) return 1;
    return 0;
}
//supporting function for toggling the visibility of an element. Used in display aggregation functions
function togglevisibility(e) {
    if (e.style.display === "none") {
        e.style.display = "block";
    }
    else {
        e.style.display = "none";
    }
}
//supporting function for changing the collapsible and collapsed icons once the button is clicked
function changeicon(e) {
    e.classList.toggle("fa-sort-down");
    e.classList.toggle("fa-sort-up");
}
//supporting for creating a textinput area
function createTextArea() {
    var textarea = document.createElement('textarea');
    textarea.type = "field";
    textarea.classList.add("form-control", "bg-light", "border-0", "small");
    textarea.style.marginTop = '0px';
    return textarea;
}
//function for creating the total aggregation of a BP's rating to allow for quick insight into the ratings without looking into individual ratings or aggregations within the dimensions
function createTotalAggregation(root, transposedScores, transposedInfo) {
    const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    var dimensionScores = [];
    var type = null;
    var lengte_ = 0;
    //parse all scores and extract the average score per dimension
    dimensionAvglist = []
    for (dimension of transposedScores) {
        dimensionScorelist = [];
        for (score of dimension) {
            score = parseInt(score);
            dimensionScorelist.push(score);
        }
        lengte_ = dimensionScorelist.length;
        dimensionAvglist.push(arrAvg(dimensionScorelist));
    }
    //extract the dimension info per dimension
    //calculate % with the use of dimensionmax and avgdimension

    for (i in transposedInfo) {
        dimension = transposedInfo[i];
        type = dimension[0];
        let dimensionname = dimension[1];
        let dimensionmax = dimension[2];
        let dimensionavg = dimensionAvglist[i];
        switch (type) {
            case 'slider':
                score = (dimensionavg / dimensionmax) * 100;
                break;
            case 'stars':
                score = (dimensionavg / dimensionmax) * 100;
                break;
            case 'dislikelike':
                score = dimensionavg;
                break;
            case 'eBay':
                score = dimensionavg;
                break;
            case 'binstars':
                score = 0;
                break;
            case 'like':
                score = 0;
                break;
        }
        dimensionScores.push([score, dimensionavg, dimensionname]);
    }
    //get scores from the dimensionScores
    var scores = dimensionScores.map(function (x) { return x[0]; });

    // make sure to give a score, otherwhise arrAvg = undefined
    if (transposedScores[0]) {
        if (transposedScores[0].length > 0) {
            score = arrAvg(scores);
        }
    }
    else {
        score = 0;
    }

    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.marginTop = '1%';
    wrapper.style.marginBottom = '1%';
    wrapper.style.flexDirection = 'row';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.justifyContent = 'flex-start';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginLeft = '10%'
    wrapper.style.flexFlow = 'row wrap'

  
    var label = document.createElement('h5');
    label.innerText = "Overall rating";
    label.style.marginBottom = 'auto';
    label.style.marginTop = 'auto';
    label.style.marginLeft = '10%'

    var avglabel = document.createElement('p');
    avglabel.style.marginBottom = '0';
    avglabel.style.marginRight = '1em';

    var amtlabel = document.createElement('p');
    amtlabel.innerText = roundScore(lengte_) + ' ratings';
    amtlabel.style.marginBottom = '0';
    amtlabel.style.marginRight = '1em';

    //Mechanism dependent styling and elements
    switch (type) {
        case 'slider':
            label.style.marginLeft = '10%';
            label.style.marginRight = 'auto';
            label.style.marginRight = '8%';
            avglabel.style.width = '10%';
            avglabel.style.marginRight = 'auto';
            amtlabel.style.width = '10%';

            bar = createbarrating(wrapper, 0, 100, 1, score, "readOnly");
            bar.style.marginRight = 'auto';
            avglabel.innerText = Math.round(score) + ' / ' + 100;
            wrapper.appendChild(avglabel);
            break;
        case 'stars':
            starRatingResult(wrapper, Math.round(score), 5);
            avglabel.innerText = Math.round(score / 100 * 5 * 10) / 10 + ' / ' + 5;
            wrapper.appendChild(avglabel);
            break;
        case 'dislikelike':
            label.style.width = '23%';
            label.style.marginLeft = '10%';

            counterpos = 0;
            counterneg = 0;
            if ((transposedScores[0])) {
                var scores = transposedScores[0].map(numStr => parseInt(numStr));
            }
            else scores = [0];
            for (score of scores) {
                if (score < 0) { counterneg += 1; }
                else if (score > 0) { counterpos += 1; }
            }

            createLike(wrapper);
            postext = document.createElement('p');
            postext.style.marginTop = 'auto';
            postext.style.marginBottom = 'auto';
            postext.innerText = roundScore(counterpos);
            postext.style.marginRight = '5px';
            wrapper.append(postext);
            createDislike(wrapper);
            negtext = document.createElement('p');
            negtext.style.marginTop = 'auto';
            negtext.style.marginBottom = 'auto';
            negtext.innerText = roundScore(counterneg);
            wrapper.append(negtext);
            break;
        case 'eBay':
            label.style.width = '23%';
            label.style.marginLeft = '10%';

            counterpos = 0;
            counterneut = 0;
            counterneg = 0;
            if (transposedScores[0].length) {
                var scores = transposedScores[0].map(numStr => parseInt(numStr));
            }
            else { score = [] }
            for (score of scores) {
                if (score == 0) { counterneut += 1; }
                else if (score < 0) { counterneg += 1; }
                else if (score > 0) { counterpos += 1; }
            }
            createEbayRating(wrapper, 'readOnly', roundScore(counterneg), roundScore(counterneut), roundScore(counterpos));
            break;
        case 'binstars':
            label.style.marginLeft = '10%';
            label.style.marginRight = 'auto';
            label.style.width = '22%';

            totallength = transposedScores.length;
            neglist = [];
            poslist = [];
            neutlist = [];

            let max = 0;
            let pAVG = 0;
            let nAvg = 0;
            let pAmt = 0;
            let nAmt = 0;

            if (transposedScores.length > 0) {
                for (i of transpose(transposedScores)) {
                    avgScore = arrAvg(i.map(Number));
                    if (avgScore > 0) { poslist.push(avgScore); }
                    else if (avgScore < 0) { neglist.push(avgScore); }
                    else if (avgScore == 0) { neutlist.push(avgScore); }
                }
                max = 5;
                pAVG = Math.round(arrAvg(poslist) * 10) / 10;
                nAvg = Math.round(arrAvg(neglist) * 10) / 10;
                pAmt = poslist.length;
                nAmt = neglist.length;
            }
            else {
                max = 5;
                pAVG = 0;
                pAmt = 0;
                nAvg = 0;
                nAmt = 0;
            }
            if (!pAVG) { pAVG = 0; }
            if (!pAmt) { pAmt = 0; }
            if (!nAvg) { nAvg = 0; }
            if (!nAmt) { nAmt = 0; }

            let tAvg = arrAvg(neglist.concat(poslist));
            mech = createBinaryStarRating(wrapper, max, max, "readOnlyAgg", nAvg, pAVG, pAmt, nAmt, tAvg);
            mech.style.marginRight = 'auto';
            break;
        case 'like':
            label.style.width = '23%';
            label.style.marginLeft = '10%';

            if ((transposedScores[0])) {
                var scores = transposedScores[0].map(numStr => parseInt(numStr));
            }
            else { scores = [0]; }
            createLike(wrapper);
            postext = document.createElement('p');
            postext.style.marginTop = 'auto';
            postext.style.marginBottom = 'auto';
            postext.innerText = scores.length;
            postext.style.marginRight = '5px';
            break;
    }

    wrapper.appendChild(amtlabel);
    root.appendChild(label)
    root.appendChild(wrapper);
}
//supporting function to round of scores to powers of 1000 (1k) or 1000000 (1m)
function roundScore(score) {
    if (score > 1000 && score < 1000000) {
        score = score / 1000 + 'K';
    }
    if (score >= 1000000) {
        score = score / 1000000 + 'M';
    }
    return score;
}
//function for finding out if a user has already made a rating and if so return the ratingsID
async function getRatingOfCurrentUser() {
    let userEmail = getUserEmail()
    let ratingid = null;
    startstring = findPath(collectionPaths, 'bestpractices') + '/';
    collectionstring = "/ratings/"
    totalstring = startstring.concat(BPid, collectionstring);
    await db.collection(totalstring)
        .where("email", "==", userEmail)
        .get()
        .then(async function (querySnapshot) {
            await querySnapshot.forEach(function (doc) {
                ratingid = doc.id;
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });;
    return (ratingid);
}

//function for toggling visibility
function makeinvisible(id1, id2) {
    document.getElementById(id1).style.display = "none";
    document.getElementById(id2).style.display = "block";
}