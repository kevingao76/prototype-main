export const handleJoyrideCallback = (data, setStepIndex, setRun) => {
    const { action, index, status, type } = data;
    if (type === 'step:after') {
      if (action === 'next') {
        setStepIndex(index + 1);
      } else if (action === 'prev') {
        setStepIndex(index - 1);
      }
    } else if (status === 'finished' || status === 'skipped') {
      setRun(false);
    }
  };
  