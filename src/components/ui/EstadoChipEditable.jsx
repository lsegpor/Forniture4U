import { useState } from 'react';
import {
    Box,
    Chip,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const EstadoChipEditable = ({
    pedido,
    onEstadoChange,
    disabled = false
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const estados = [
        { valor: 'pendiente', label: 'Pendiente', color: 'error' },
        { valor: 'procesando', label: 'Procesando', color: 'warning' },
        { valor: 'finalizado', label: 'Finalizado', color: 'success' }
    ];

    const getChipColor = (estado) => {
        switch (estado) {
            case 'finalizado':
                return 'success';
            case 'procesando':
                return 'warning';
            case 'pendiente':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleClick = (event) => {
        if (!disabled) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEstadoChange = async (nuevoEstado) => {
        if (nuevoEstado === pedido.estado) {
            handleClose();
            return;
        }

        try {
            await onEstadoChange(pedido.id_pedido, nuevoEstado);
            handleClose();
        } catch (error) {
            console.error('Error actualizando estado:', error);
            // Aquí podrías mostrar un snackbar o toast con el error
        }
    };

    return (
        <>
            <Tooltip
                title={disabled ? "Estado del pedido" : "Haz clic para editar estado"}
                arrow
            >
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Chip
                        label={pedido.estado}
                        size="small"
                        color={getChipColor(pedido.estado)}
                        variant="outlined"
                        onClick={handleClick}
                        sx={{
                            cursor: disabled ? 'default' : 'pointer',
                            '&:hover': disabled ? {} : {
                                backgroundColor: 'action.hover',
                                transform: 'scale(1.05)',
                                transition: 'transform 0.2s ease-in-out'
                            }
                        }}
                        icon={<EditIcon sx={{ fontSize: 16 }} />}
                    />
                </Box>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 150
                    }
                }}
            >
                {estados.map((estado) => (
                    <MenuItem
                        key={estado.valor}
                        onClick={() => handleEstadoChange(estado.valor)}
                        selected={estado.valor === pedido.estado}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <Chip
                            label={estado.label}
                            size="small"
                            color={estado.color}
                            variant="outlined"
                            sx={{ minWidth: 90 }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default EstadoChipEditable;