import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationPopup from '@/components/confirmationPopup';
import Mode from '../../constants/mode';
import React from 'react';
import '@testing-library/jest-dom'

describe('ConfirmationPopup Component', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  test('renders confirmation popup with correct message for pengawasan mode', () => {
    render(<ConfirmationPopup mode={Mode.pengawasan} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).toBeInTheDocument();
  });

  test('renders confirmation popup with correct message for pribadi mode', () => {
    render(<ConfirmationPopup mode={Mode.pribadi} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText('Ubah analisis menjadi pribadi?')).toBeInTheDocument();
  });

  test('calls onConfirm when Simpan button is clicked', () => {
    render(<ConfirmationPopup mode={Mode.pengawasan} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Simpan'));
    expect(onConfirm).toHaveBeenCalled();
  });

  test('calls onCancel when Batal button is clicked', () => {
    render(<ConfirmationPopup mode={Mode.pengawasan} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Batal'));
    expect(onCancel).toHaveBeenCalled();
  });

  test('closes popup when Simpan button is clicked', () => {
    render(<ConfirmationPopup mode={Mode.pengawasan} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Simpan'));
    expect(screen.queryByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).not.toBeInTheDocument();
  });

  test('closes popup when Batal button is clicked', () => {
    render(<ConfirmationPopup mode={Mode.pengawasan} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Batal'));
    expect(screen.queryByText('Apakah Anda yakin ingin menampilkan analisis ini kepada Admin?')).not.toBeInTheDocument();
  });
});