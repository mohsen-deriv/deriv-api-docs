import apiManager from '@site/src/configs/websocket';
import {
  TSocketResponse,
  TSocketResponseData,
  TSocketSubscribableEndpointNames,
} from '@site/src/configs/websocket/types';
import { useCallback, useState } from 'react';

const useSubscription = <T extends TSocketSubscribableEndpointNames>(name: T) => {
  const [is_loading, setIsLoading] = useState(false);
  const [is_subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<unknown>();
  const [data, setData] = useState<TSocketResponseData<T>>();
  const [subscriber, setSubscriber] = useState<{ unsubscribe?: VoidFunction }>();

  const onData = useCallback(
    (response: TSocketResponse<T>) => {
      setData(response[name === 'ticks' ? 'tick' : name] as TSocketResponseData<T>);
      setIsLoading(false);
    },
    [name],
  );

  const onError = useCallback((response: TSocketResponse<T>) => {
    setError(response.error);
    setIsLoading(false);
  }, []);

  const subscribe = useCallback(
    (data: Parameters<typeof apiManager.augmentedSubscribe<T>>[1]) => {
      setIsLoading(true);
      setSubscribed(true);

      try {
        setSubscriber(apiManager.augmentedSubscribe(name, data).subscribe(onData, onError));
      } catch (e) {
        setError(e);
      }
    },
    [name, onData, onError],
  );

  const unsubscribe = useCallback(() => {
    subscriber?.unsubscribe?.();
    setSubscribed(false);
  }, [subscriber]);

  return { subscribe, unsubscribe, is_loading, is_subscribed, error, data };
};

export default useSubscription;
