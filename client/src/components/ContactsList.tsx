import { Outlet } from 'react-router-dom';
import '../styles/ContactsList.css'

interface Contact {
    name: string;
    phone: string;
    avatar?: string;
  }
  
  const contacts: Contact[] = [
    { name: 'Alice', phone: '+447658765453', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { name: 'Anna', phone: '+407792204635', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: 'Antoine', phone: '+12899415733', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: 'Armand', phone: '+16474883960', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { name: 'Ava', phone: '+32652029525' }, 
    { name: 'Axel', phone: '+44785130670', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { name: 'Bastien', phone: '+447835639591' },
    { name: 'Beatrice', phone: '+447807675702' },
    { name: 'Ben', phone: '+16477717109' },
    { name: 'Bernard', phone: '+34646655462' },
    { name: 'Bertrand', phone: '+447553211628' },
    { name: 'Bylel', phone: '+33618324820', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
  ];


export default function ContactsList() {
  return    ( 
    <div className='row'>
  <div className="contacts-container">
  <div className="header">
    <h1>Contacts</h1>
    <button className="add-contact-button">+</button>
  </div>
  <div className="search-bar">
    <input type="text" placeholder="Search here..." />
  </div>
  <div className="contacts-list">
    {contacts.map((contact, index) => (
      <div key={index} className="contact-item">
        <div className="avatar">
          {contact.avatar ? (
            <img src={contact.avatar} alt={contact.name} />
          ) : (
            <div className="default-avatar">
              {contact.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="contact-info">
          <p className="contact-name">{contact.name}</p>
          <p className="contact-phone">{contact.phone}</p>
        </div>
      </div>
    ))}
  </div>
  
</div>
<Outlet/>
</div>
  )
}
