// Based on ur5testresult_header.xlsx
export const COL_TIME = 0;

// Target vs Actual Position (Kinematics)
export const T_POS = [1, 2, 3, 4, 5, 6];
export const A_POS = [7, 8, 9, 10, 11, 12];

// Target vs Actual Velocity (Kinematics)
export const T_VEL = [13, 14, 15, 16, 17, 18];
export const A_VEL = [19, 20, 21, 22, 23, 24];

// Target vs Actual Current (Electrical)
export const T_CUR = [25, 26, 27, 28, 29, 30];
export const A_CUR = [31, 32, 33, 34, 35, 36];

// Target Acceleration (Dynamics)
export const T_ACC = [37, 38, 39, 40, 41, 42];

// Target Torque (Dynamics)
export const T_TORQUE = [43, 44, 45, 46, 47, 48];

// Control Current (Electrical)
export const C_CUR = [49, 50, 51, 52, 53, 54];

// TCP Coordinates (Kinematics)
export const TCP_POS = [55, 56, 57]; // x, y, z
export const TCP_ORIENT = [58, 59, 60]; // rx, ry, rz

// TCP Force (Dynamics)
export const TCP_FORCE = [61, 62, 63]; // Fx, Fy, Fz
export const TCP_TORQUE = [64, 65, 66]; // Tx, Ty, Tz

// Joint Temps (Diagnostics)
export const TEMPS = [67, 68, 69, 70, 71, 72];