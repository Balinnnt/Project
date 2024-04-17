import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './App.css';

const App = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUserID, setSelectedUserID] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [Title, setTitle] = useState('');
  const [Content, setContent] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);

  const fetchUsers = async () => {
    try {
      const usersResponse = await fetch('http://localhost:8000/getfelhasznalok');
      const usersData = await usersResponse.json();
      setAllUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Hiba a felhasználók lekérdezése során: ', error);
      setLoading(false);
    }
  };

  const fetchNotes = async (UserID) => {
    try {
      if (UserID) {
        const notesResponse = await fetch(`http://localhost:8000/getjegyzetek/${UserID}`);
        const notesData = await notesResponse.json();
        setFilteredNotes(notesData);
      } else {
        console.log("UserID is undefined or null");
      }
    } catch (error) {
      console.error('Hiba a jegyzetek lekérdezése során: ', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchNotes();
  }, []);

  const handleUserClick = async (UserID) => {
    setSelectedUserID(UserID);
    if (UserID) {
      await fetchNotes(UserID);
    } else {
      console.log("Hiba*");
    }
    setShowAddButton(true);
  };


  const handleDeleteUser = async (userID) => {
    setDeleteModalIsOpen(true);
    setSelectedUserID(userID);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/deleteuser/${selectedUserID}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
        alert('Felhasználó törölve!');
      } else {
        alert('Hiba történt a felhasználó törlése során.');
      }
    } catch (error) {
      console.error('Hiba a törlés során: ', error);
      alert('Hiba történt a felhasználó törlése során.');
    } finally {
      setDeleteModalIsOpen(false);
    }
  };

  const closeModal = () => {
    setDetailsModalIsOpen(false);
    setDeleteModalIsOpen(false);
    setModalIsOpen(false);
  };


  const handleTitleClick = (selectedNote) => {
    setDetailsModalIsOpen(true);
    setSelectedNote(selectedNote);
  };

  const handleAddNote = () => {
    // Ellenőrizzük, hogy a cím és a jegyzet nem üres
    if (!Title.trim() || !Content.trim() || !selectedUserID) {
      alert('Kérlek add meg a címet, a jegyzetet, és válassz ki egy felhasználót.');
      return;
    }
  
    // Küldjük el az új jegyzetet a backend felé
    fetch('http://localhost:8000/addnote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ UserID: selectedUserID, Title, Content }),
    })
      .then(response => {
        if (response.ok) {
          console.log('Új jegyzet sikeresen hozzáadva.');
          closeModal();
          fetchNotes(selectedUserID); // Frissítjük a jegyzeteket
          alert('Az új jegyzet sikeresen hozzáadva.');
        } else {
          console.error('Hiba történt az új jegyzet hozzáadása során.');
          alert('Hiba történt az új jegyzet hozzáadása során.');
        }
      })
      .catch(error => {
        console.error('Hiba a hálózati kérés során:', error);
        alert('Hiba történt az új jegyzet hozzáadása során.');
      });
  };
  
  const handleAddNewData = () => {
    setModalIsOpen(true);
    console.log('Új adat hozzáadása');
  };

  return (
    <div className="App">
      <div className="leftSide">
        <h1>Felhasználók:</h1>
        <ul>
          {allUsers.map((user) => (
            <li key={user.UserID} onClick={() => handleUserClick(user.UserID)}>
              {user.username}
              <button onClick={() => handleDeleteUser(user.UserID)} className="delete-button">Törlés</button>
            </li>
          ))}
        </ul>
      </div>
      

      <div className="rightSide">
        {loading ? (
          <p>Loading...</p>
        ) : (
          selectedUserID ? (
            <ul>
              {filteredNotes.map((note) => (
                <li key={note.id} onClick={() => handleTitleClick(note)}>
                  <h2 className="Title">{note.Title}</h2>
                </li>
              ))}
              {showAddButton && ( // Csak akkor jelenítjük meg az új adat hozzáadása gombot, ha showAddButton igaz
                <button onClick={handleAddNewData} className="add-new-data-button">
                  Új adat hozzáadás
                </button>
              )}
            </ul>
          ) : (
            <p>No selected user...</p>
          )
        )}
      </div>




      <Modal
        isOpen={detailsModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Jegyzet Részletei"
        className="Modal"
        overlayClassName="Overlay"
      >
        <div className="modal-content">
          <h1>{selectedNote ? selectedNote.Title : ''}</h1>
          <hr />
          <p>{selectedNote ? selectedNote.Content : ''}</p>
          <button onClick={closeModal} className="Close-Button">
            Bezárás
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Törlés megerősítése"
        className="Modal2"
        overlayClassName="Overlay2"
      >
        <div className="delete-modal-content">
          <p>Biztosan törölni szeretnéd ezt a felhasználót?</p>
          <div className="button-container">
            <button onClick={confirmDelete} className="delete-yes">Igen</button>
            <button onClick={closeModal} className="delete-no">Nem</button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Új adat hozzáadása"
        className="Modalnd"
        overlayClassName="Overlaynd"
      >
        <div className="modal-content-nd">
          <h2>Új adat hozzáadása</h2>
          <label>Cím:</label>
          <input type="text" value={Title} onChange={(e) => setTitle(e.target.value)} />
          <label>Jegyzet:</label>
          <textarea value={Content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={handleAddNote}>Hozzáadás</button>
          <button onClick={closeModal}>Bezárás</button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
