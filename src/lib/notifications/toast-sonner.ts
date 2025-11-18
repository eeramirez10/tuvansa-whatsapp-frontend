
import { toast } from "sonner";

export const notify = {
  info: (msg: string, opts?: Parameters<typeof toast>[1]) => toast(msg, opts),
  success: (msg: string, desc?: string) =>
    toast.success(msg, desc ? { description: desc } : undefined),
  warning: (msg: string, desc?: string) =>
    toast.warning(msg, desc ? { description: desc } : undefined),
  error: (msg: string, desc?: string) =>
    toast.error(msg, desc ? { description: desc } : undefined),
  promise: <T>(p: Promise<T>, msgs: { loading: string; success:(data:T) =>  string; error:(e:Error) => string;  finally?:() => void }) =>
    toast.promise(p, msgs),
};