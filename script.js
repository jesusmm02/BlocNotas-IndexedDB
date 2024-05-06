document.addEventListener('DOMContentLoaded', function () {
    var noteIdCounter = 0;

    // Abrir o crear la base de datos de IndexedDB
    var request = window.indexedDB.open('notasDB', 1);
    var db;

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("Base de datos abierta correctamente");
        // Cargar notas existentes al cargar la página
        loadNotes();
    };

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        var objectStore = db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
        console.log("Base de datos creada correctamente");
    };

    request.onerror = function (event) {
        console.error("Error al abrir la base de datos: ", event.target.errorCode);
    };


    // Función para cargar las notas
    function loadNotes() {
      var transaction = db.transaction(["notas"], "readonly");
      var objectStore = transaction.objectStore("notas");
    
      // Limpiar el contenedor de notas antes de cargar las nuevas notas
      document.getElementById('note').innerHTML = '';
    
      objectStore.openCursor().onsuccess = function (event) {
          var cursor = event.target.result;
          if (cursor) {
              if (cursor.value && cursor.value.id) {
                  var noteId = cursor.value.id;

                  var noteHtml = '<div id="' + noteId + '"class="note-card">' +
                                      '<div class="tools">' +
                                          '<button class="edit"><img src="https://cdn.pixabay.com/photo/2019/04/08/20/26/pencil-4112898_1280.png" width="20px"></button>' +
                                          '<button class="delete" id="deleteNote"><img src="https://cdn-icons-png.flaticon.com/512/18/18297.png" width="20px"></button>' +
                                      '</div>' +
                                      '<textarea class="note-content">' + cursor.value.content + '</textarea>' +
                                  '</div>';
                      
                  document.getElementById('note').insertAdjacentHTML('beforeend', noteHtml);
                  // Agregar evento de cambio de contenido para actualizar la nota en la base de datos
                  var noteContent = document.getElementById(noteId).getElementsByClassName('note-content')[0];
                  noteContent.addEventListener('input', function (event) {
                      updateNoteContentInDB(noteId, noteContent.value);
                  });
    
              }
              cursor.continue();
          }
      };
    }

    // Función para actualizar el contenido de una nota en IndexedDB
    function updateNoteContentInDB(id, content) {
      var transaction = db.transaction(["notas"], "readwrite");
      var objectStore = transaction.objectStore("notas");
      var request = objectStore.get(id);

      request.onsuccess = function (event) {
          var note = event.target.result;
          note.content = content;
          var updateRequest = objectStore.put(note);

          updateRequest.onsuccess = function (event) {
              console.log("Contenido de la nota actualizado correctamente en IndexedDB");
          };

          updateRequest.onerror = function (event) {
              console.error("Error al actualizar el contenido de la nota en IndexedDB: ", event.target.errorCode);
          };
      };

      request.onerror = function (event) {
          console.error("Error al obtener la nota de IndexedDB para actualizar el contenido: ", event.target.errorCode);
      };
    }



    // Función para agregar nota a IndexedDB y al DOM
    function addNoteToDBAndDOM(content) {
      var transaction = db.transaction(["notas"], "readwrite");
      var objectStore = transaction.objectStore("notas");
      var newNote = { content: content };
      var request = objectStore.add(newNote);

      request.onsuccess = function (event) {
          console.log("Nota agregada correctamente");
          loadNotes(); // Recargar notas después de agregar una nueva
      };

      request.onerror = function (event) {
          console.error("Error al agregar la nota: ", event.target.errorCode);
      };
    }

    /**
     * Función para agregar una nota
     */
    document.getElementById('add').addEventListener('click', function () {
      var noteContent = ''; // Obtener contenido de la nota, puedes modificar para adaptarlo a tus necesidades
      addNoteToDBAndDOM(noteContent);
    });


    
    // Función para eliminar nota de IndexedDB y del DOM
    function deleteNoteFromDBAndDOM(id) {
      var transaction = db.transaction(["notas"], "readwrite");
      var objectStore = transaction.objectStore("notas");
      var request = objectStore.delete(id);

      request.onsuccess = function (event) {
          console.log("Nota eliminada correctamente");
          document.getElementById(id).remove(); // Eliminar la nota del DOM
      };

      request.onerror = function (event) {
          console.error("Error al eliminar la nota: ", event.target.errorCode);
      };
    }

    // Eliminar nota
    document.getElementById('note').addEventListener('click', function (event) {
      if (event.target.classList.contains('delete') || event.target.closest('.delete')) {
          var noteId = parseInt(event.target.closest('.note-card').id);
          deleteNoteFromDBAndDOM(noteId);
      }
    });



    // Función para eliminar todas las notas de IndexedDB y del DOM
    function deleteAllNotesFromDBAndDOM() {
      var transaction = db.transaction(["notas"], "readwrite");
      var objectStore = transaction.objectStore("notas");
      var request = objectStore.clear();

      request.onsuccess = function (event) {
          console.log("Todas las notas fueron eliminadas correctamente");
          document.getElementById('note').innerHTML = ''; // Limpiar el contenedor de notas en el DOM
      };

      request.onerror = function (event) {
          console.error("Error al eliminar todas las notas: ", event.target.errorCode);
      };
    }

    // Eliminar todas las notas
    document.getElementById('deleteAll').addEventListener('click', function () {
        deleteAllNotesFromDBAndDOM();
    });

});