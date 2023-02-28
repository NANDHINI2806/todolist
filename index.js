// to check user accidentally clicked to close while editing
var accidentalPopUp = false;
// defining months to set date
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
$(function(){

    const cardBackgroundColors ={
        purple : '#e6cdeb',
        grey_white : '#fcfcfc',
        yellow : '#f7cd7f',
        limegreen : '#e7ee9b',
        peach : '#f2ac90',
    }
    // setting default color
    let currentSelectedColor = 'limegreen';
    // initialising the array  
    let notesArray =[];
    // setting the id value
    let idCounter = 1;
    // defining functions to create dom Elements
    let notesBuilder = {
        _id : function(cardObject){
            return ($('<div>',{
                class : '_id',
            }).css('display','none').text(cardObject[i]));
        },
        heading : function(cardObject){
            return ($('<h2>',{
                class : 'notes-card-header',
            }).text(cardObject[i]));
        },

        date : function(cardObject){
            return ($('<div>',{
                class : 'date',
            }).text(cardObject[i]));
        },

        imageUrl : function(cardObject){
            if(cardObject[i].length)
            {
                return ($('<div>',{
                    class : 'note-image-container',
                }).append(
                    $('<img>',{
                        src : cardObject[i],
                        alt : "image"
                    })
                ));
            }
        },

        content : function(cardObject){
            return  ($('<div>',{
                class : 'note-content',
            }).append(
                $('<p>').text(cardObject[i])
            ));
        },
        backGroundColor : function(cardObject){
            return  ($('<div>',{
                class : 'notes-card',
            }).css("background-color",cardBackgroundColors[cardObject[i]]));
        }
    }
    
    let pagination = 1;
    let limit = 0;
    let dateObject = new Date();

    // check wether the given browser has our notes already
    if(!localStorage.getItem('notes'))
    {
        localStorage.setItem('notes',JSON.stringify(notesArray));
        localStorage.setItem('idCounter',JSON.stringify(idCounter));
        localStorage.setItem('currentSelectedColor',JSON.stringify(currentSelectedColor));
        $('.delete-all').hide();
        $('.on-all-delete').show();
        $('.load-more').hide();
    }
    else
    {
        notesArray = JSON.parse(localStorage.getItem('notes'));
        idCounter = JSON.parse(localStorage.getItem('idCounter'));
        currentSelectedColor = JSON.parse(localStorage.getItem('currentSelectedColor'));
        if(!notesArray.length)
        {
            $('.on-all-delete').show();
            $('.delete-all').hide();
            $('.load-more').hide();
        }
        showCards();
    }
    // setting a default color value for the card
    $("."+currentSelectedColor+"Tick").show();

    // once new card is added its stored locally
    let storeLocal = function(){
        localStorage.setItem('notes',JSON.stringify(notesArray));
        localStorage.setItem('idCounter',JSON.stringify(idCounter));
        localStorage.setItem('currentSelectedColor',JSON.stringify(currentSelectedColor));        
    }

    // creating notes object
    let noteCreator = function(heading,image,content,color){
        dateObject = new Date();
        let newNote = {
            _id : idCounter++,
            heading : heading,
            date : months[dateObject.getMonth()-1]+" "+dateObject.getDate()+", "+dateObject.getFullYear(),
            dateWithTime : dateObject,
            imageUrl : image,
            content : content,
            backGroundColor : color,
        }
        return newNote;
    }

    

    // disabling and enabling the new button
    $(".notes-title").keyup(buttonEnabler);
    $(".notes-content").keyup(buttonEnabler);
    function buttonEnabler() {
       if($(".notes-title").val().replace(/\s+/g, '') === '' || $(".notes-content").val().replace(/\s+/g, '') === '')
       {
            $(".add-note-button").prop('disabled',true);
            accidentalPopUp = false;
       } 
       else
       {
            $(".add-note-button").prop('disabled',false);
            accidentalPopUp = true;         
       }
    }

    // create new note function
    $(".add-note-button").click(newNote);
    function newNote() {
        $('.on-all-delete').hide();
        $('.delete-all').show();
        $formData = $('form').serializeArray();
        let heading = '';
        let imageUrl = '';
        let content = '';
        for(i of $formData)
        {
            switch (i.name) {
                case "head":
                    heading = i.value;
                    break;
                
                case "imageUrl":
                    imageUrl = i.value;
                    break;

                case "content":
                    content = i.value;
                    break; 

                default:
            }
        
        }
        $('form').trigger('reset');
        $(".add-note-button").prop('disabled',true);
        accidentalPopUp = false;
        let newCard = noteCreator(heading,imageUrl,content,currentSelectedColor);
        notesArray.unshift(newCard);
        storeLocal();
        sidebarClose();
        notesArray.sort(function(a, b){
            const date1 = new Date(a.dateWithTime);
            const date2 = new Date(b.dateWithTime);
            
            return date1 - date2;
        })
        addCard(newCard);
    }

    // create a single card element to add div
    function createCard(cardObject)
    {
        let $fragment = $(document.createDocumentFragment());
        let $noteChildFragments = $(document.createDocumentFragment());
        let $notesCard;
        for(i in cardObject)
        {
            if (i=='backGroundColor')
            {
                $notesCard = notesBuilder[i](cardObject);
            }
            else if(notesBuilder[i])
            {
                $noteChildFragments.append(notesBuilder[i](cardObject));
            }
        }
        $notesCard.append($noteChildFragments);
        $fragment.append($notesCard);
        return $fragment;
    }
    

// ----------------- Module region ----------------------


    // displaying the cards
    function showCards() {
        notesArray.sort(function(a, b){
            const date1 = new Date(a.dateWithTime);
            const date2 = new Date(b.dateWithTime);
            return date2 - date1;
        })
        let $fragment = $(document.createDocumentFragment());
        let i = limit;
        limit = pagination*10 < notesArray.length ? pagination*10 : notesArray.length;
        for( ; i < limit ;i++)
        {
            $fragment.append(createCard(notesArray[i]));
        }
        if(notesArray.length > pagination*10)
        {
            $('.load-more').show();
        }
        else
        {
            $('.load-more').hide();
        }
        $('.notes-area').append($fragment); 
        setListener();    
    }

    // choosing the color for the card
    $(".color-selector").click(changeColor);
    function changeColor(){
        let color = this.className.split(" ")[1];
        $("."+currentSelectedColor+"Tick").hide();
        currentSelectedColor = color;
        $("."+currentSelectedColor+"Tick").show();
    }

    // add a single card to dom
    function addCard(newCardObject)
    {
        $fragment = createCard(newCardObject);
        $('.notes-area').prepend($fragment);
        setListener();
    }
    // pagination logic
    $('.load-more').click(incrementPagenation);
    function incrementPagenation()
    {
        pagination++;
        showCards();
    }
    // overlay appear
    function overlayOn()
    {
        $('.overlay').css('display','block');
    }
    // overlay disappear
    function overlayOff()
    {
        $('.overlay').css('display','none');
    }
    // closing the sidebar when overlay is been clicked
    $('.overlay').click(sidebarClose);
    $('.overlay').click(popupClose);
    // sidebar close
    $('.sidebar-close').click(sidebarClose);
    function sidebarClose()
    {
        if(accidentalPopUp)
        {
            $('.pop-up-accidental').show();
            overlayOn();
        }
        else{
            overlayOff();
            $('.side-bar').css('transform','translate(2000px)');
        }
        
    }
    // sidebar open
    $('.new').click(sidebarOpen);
    $('.edit').click(sidebarOpen);
    function sidebarOpen()
    {
        overlayOn();
        $('.side-bar').css('transform','translate(0px)'); 
    }
    // pop up appear
    $('.delete-all').click(popupAppear);
    $('.delete-edit').click(popupAppear);
    function popupAppear()
    {
        overlayOn();
        $('.pop-up').show();    
    }
    // pop up close
    $('.pop-up-close').click(popupClose);
    function popupClose()
    {
        if(!accidentalPopUp)
        {
            overlayOff();
        }
        $('.pop-up').hide();
    }
    // accidental-pop-up-close
    $('.pop-up-accidental-close').click(accidentalPopUpClose)
    function accidentalPopUpClose()
    {
        console.log("here");
        $('.pop-up-accidental').hide();
    }
    // accidental pop-up selected
    $('.close-edit-button').click(closeForm);
    function closeForm()
    {
        accidentalPopUp = false;
        $(".add-note-button").prop('disabled',true);
        $('form').trigger('reset');
        accidentalPopUpClose();
        sidebarClose();
    }
    // accidental pop-up selected
    $('.close-edit-single-button').click(closeSingleCardForm);
    function closeSingleCardForm()
    {
        accidentalPopUp = false;
        accidentalPopUpClose();
        sidebarClose();
        location.reload();
    }
    // delete all
    $('.delete-button').click(deleteAll);
    function deleteAll()
    {
        notesArray = [];
        idCounter = 1;
        currentSelectedColor = 'limegreen';
        storeLocal();
        popupClose();
        location.reload();
        showCards();
    }
    // redirecting to new page
    function setListener()
    {
        $('.notes-card').click(redirect);
    }
    setListener();
    function redirect()
    {
        localStorage.setItem('selectedCardId',JSON.stringify( $(this).children('._id').text()));
        $("."+currentSelectedColor+"Tick").hide();
        location.href = './card_page.html';
    }
})