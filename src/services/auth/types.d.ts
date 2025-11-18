export interface LoginResponse {
  token: string;
  user:  User;
}

export interface User {
  id:        string;
  name:      string;
  lastname:  string;
  username:  string;
  email:     string;
  phone:     string;
  role:      string;
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
  branchId:  string;
  branch:    Branch;
}

export interface Branch {
  id:        string;
  name:      string;
  address:   string;
  createdAt: Date;
  updatedAt: Date;
}
