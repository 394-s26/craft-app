import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

const mailCollection = collection(db, 'mail');

export const sendCraftShareEmail = async (
  fromName: string,
  fromEmail: string,
  toEmail: string,
  craftTitle: string,
  craftUrl: string,
): Promise<void> => {
  await addDoc(mailCollection, {
    to: toEmail,
    message: {
      subject: `${fromName} shared "${craftTitle}" with you on Crafter`,
      html: `
        <p>Hi!</p>
        <p><strong>${fromName}</strong> (${fromEmail}) shared their craft <strong>"${craftTitle}"</strong> with you.</p>
        <p><a href="${craftUrl}">View it here</a></p>
      `,
    },
  });
};

export const sendFriendInviteEmail = async (
  fromName: string,
  fromEmail: string,
  toEmail: string,
  appUrl: string,
): Promise<void> => {
  await addDoc(mailCollection, {
    to: toEmail,
    message: {
      subject: `${fromName} added you on Crafter`,
      html: `
        <p>Hi!</p>
        <p><strong>${fromName}</strong> (${fromEmail}) added you as a friend on Crafter.</p>
        <p>Sign in to see crafts they share with you:</p>
        <p><a href="${appUrl}">${appUrl}</a></p>
      `,
    },
  });
};
