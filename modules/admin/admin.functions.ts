import moment from "moment";
import { PipelineStage } from "mongoose";

export function getGamesThisYearQuery(): PipelineStage[] {
  return [
    {
      $match: {
        createdAt: {
          $gte: moment().startOf("year").toDate(),
          $lt: moment().endOf("year").toDate(),
        },
      },
    },
    {
      $group: {
        _id: {
          gameName: "$gameName",
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        gameName: "$_id.gameName",
        date: {
          $dateToString: {
            format: "%m",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
              },
            },
          },
        },
        count: 1,
      },
    },
    {
      $group: {
        _id: "$gameName",
        counts: {
          $push: {
            date: "$date",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        gameName: "$_id",
        counts: 1,
      },
    },
    {
      $sort: {
        gameName: 1,
      },
    },
  ];
}

export function getMonthsGamesData(months: string[], data: { date: string, count: number }[]) {
  return months.reduce((acc: any[], month: string) => {
    const monthStat = data.find((stat) => stat.date === month);

    if (!monthStat) return [...acc, 0];

    return [
      ...acc,
      monthStat.count,
    ]
  }, [])
}
