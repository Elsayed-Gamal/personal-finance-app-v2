'use server';

import { revalidatePath } from 'next/cache';
import {
  addMoneyToPot,
  addPot as addNewPot,
  deletePot as deleteCurrentPot,
  editPot as editCurrentPot,
  withdrawMoneyFromPot,
} from '../_services/apiPots';

export async function addMoney(potName, amount) {
  await addMoneyToPot({ potName, amount });

  revalidatePath('/pots');
}

export async function withdrawMoney(potName, amount) {
  await withdrawMoneyFromPot({ potName, amount });

  revalidatePath('/pots');
}

export async function addPot(potData) {
  const newPot = {
    name: potData.get('potName'),
    target: +potData.get('potTarget'),
    total: 0,
    theme: potData.get('potTheme'),
  };

  await addNewPot(newPot);

  revalidatePath('/pots');
}

export async function editPot(potName, formData) {
  const updatedFields = {
    name: formData.get('potName'),
    target: +formData.get('potTarget'),
    theme: formData.get('potTheme'),
  };

  await editCurrentPot({ potName, updatedFields });

  revalidatePath('/pots');
}

export async function deletePot(potName) {
  await deleteCurrentPot(potName);

  revalidatePath('/pots');
}
