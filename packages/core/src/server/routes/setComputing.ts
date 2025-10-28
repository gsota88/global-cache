import { Express, Router } from 'express';
import { getConfig } from '../config';
import { TestRunValueInfo } from '../../shared/value-info';
import { Setter } from '../setter';
import { getStorage } from '../storage';

export const router: ReturnType<typeof Router> = Router();

export type SetValueParams = {
  key: string;
  value?: unknown; // The value to set.
  error?: string; // An error occured during value computing.
};

export type SetComputingResponse =  {
  valueInfo: TestRunValueInfo,
  alreadyComputing: boolean 
}

router.post('/run/:runId/setComputing', async (req, res) => {
  const { runId } = req.params;
  const { key, value, error } = req.body as SetValueParams;
  const config = getConfig(req.app as Express);

  const { testRunStorage } = getStorage(config, runId);
  let valueInfo = (await testRunStorage.load(key))!;

  let alreadyComputing = valueInfo.state === "computing";
  if (!alreadyComputing) {
    Object.assign(valueInfo, {
      state: "computing"
    });
    await testRunStorage.save(valueInfo);
  }

  res.json({
    valueInfo,
    alreadyComputing
  });
});
