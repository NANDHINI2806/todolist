$(function(){
    // defining months to set date
    let dateObject = new Date();
    accidentalPopUp = false;
    const cardBackgroundColors ={
        purple : '#e6cdeb',
        grey_white : '#fcfcfc',
        yellow : '#f7cd7f',
        limegreen : '#e7ee9b',
        peach : '#f2ac90',
    }
    // getting the selected card from local storage
    let selectedCardId = JSON.parse(localStorage.getItem('selectedCardId'));
    let notesArray = JSON.parse(localStorage.getItem('notes'));
    let selectedCard = notesArray.find((e) => e._id == selectedCardId);
    let currentSelectedColor = JSON.parse(localStorage.getItem('currentSelectedColor'));
    $("."+currentSelectedColor+"Tick").hide();
    // if by chance any localstorage fault occurs it redirects to start page
    if(!selectedCard)
    {
        location.href = './index.html';
    }
    // constructing specific elements for the dom
    let notesBuilder = {
        _id : function(selectedCard){
            return ($('<div>',{
                class : '_id',
            }).css('display','none').text(selectedCard[i]));
        },
        heading : function(selectedCard){
            $('.edit-notes-title').attr('value',selectedCard[i]);
            return ($('<h1>',{
                class : 'notes-card-header',
            }).text(selectedCard[i]));
        },

        date : function(selectedCard){
            return ($('<div>',{
                class : 'date',
            }).text(selectedCard[i]));
        },

        imageUrl : function(selectedCard){
            $('.edit-notes-image').attr('value',selectedCard[i]);
            let $noteImageContainer;
            if(selectedCard[i].length)
            {
                $noteImageContainer = $('<div>',{
                    class : 'image',
                }).append(
                    $('<img>',{
                        src : selectedCard[i],
                        alt : "image"
                    })
                );
            }
            return ($noteImageContainer);
        },

        content : function(selectedCard){
            $('.edit-notes-content').val(selectedCard[i]);
            return  ($('<div>',{
                class : 'context',
            }).append(
                $('<p>').text(selectedCard[i])
            ));
        },
        backGroundColor : function(selectedCard){
            currentSelectedColor = selectedCard[i];
            $("."+currentSelectedColor+"Tick").show();
            return  ($('<div>',{
                class : 'color-of-card',
            }).append(
                $('<div>',{
                    class : 'card-color',
                }).css("background-color",cardBackgroundColors[selectedCard[i]])
            ));
        }
    }
    function buildPage()
    {
        let $fragment = $(document.createDocumentFragment());
        let $notesContent = $('<div>',{
            class : 'content',
        }) ;
        for(i in selectedCard)
        {
            if (i=='backGroundColor')
            {
                $fragment.append(notesBuilder[i](selectedCard));
            }
            else if(notesBuilder[i])
            {
                $notesContent.append(notesBuilder[i](selectedCard));
            }
        }
        $('.card-content-area').append($fragment);
        $('.card-content-area').append($notesContent);
    }
    // choosing the color for the card
    $(".color-selector-edit").click(changeColor);
    function changeColor(){
        let color = this.className.split(" ")[1];
        $("."+currentSelectedColor+"Tick").hide();
        currentSelectedColor = color;
        $("."+currentSelectedColor+"Tick").show();
    }

    // editing the content of the card
    $('.edit-note-button').click(editNote);
    function editNote()
    {
        $formData = $('.form-edit').serializeArray();
        
        for(i of $formData)
        {
            switch (i.name) {
                case "head":
                    selectedCard.heading = i.value;
                    break;
                
                case "imageUrl":
                    selectedCard.imageUrl = i.value;
                    break;

                case "content":
                    selectedCard.content = i.value;
                    break; 

                default:
            }
        
            selectedCard.date =months[dateObject.getMonth()-1]+" "+dateObject.getDate()+", "+dateObject.getFullYear();
            selectedCard.dateWithTime = dateObject;
        }
        selectedCard.backGroundColor = currentSelectedColor;
        storeLocal();
        location.href = './index.html';
    }
    // once new card is added its stored locally
    let storeLocal = function(){
        localStorage.setItem('notes',JSON.stringify(notesArray));
        localStorage.setItem('currentSelectedColor',JSON.stringify(currentSelectedColor));        
    }
    $(".edit-notes-title").keyup(buttonEnabler);
    $(".edit-notes-content").keyup(buttonEnabler);
    function buttonEnabler() {
       if($(".edit-notes-title").val().replace(/\s+/g, '') === '' || $(".edit-notes-content").val().replace(/\s+/g, '') === '')
       {
            $(".edit-note-button").prop('disabled',true);
            accidentalPopUp = false;
       } 
       else
       {
            $(".edit-note-button").prop('disabled',false);
            accidentalPopUp = true;         
       }
    }

    $('.delete-one-button').click(deleteCard);
    function deleteCard()
    {
        notesArray = notesArray.filter((item) => item !== selectedCard);
        storeLocal();
        location.href = './index.html';
    }
    $('.go-back').click(function(){
        location.href = './index.html';
    });
    buildPage();
});


